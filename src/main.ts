import './style.css'
import {
  findCityLocations,
  getCityWeather,
} from './services/city-weather.ts'
import type { GeocodingLocation } from './types/open-meteo.ts'
import { renderWeatherPanel } from './ui/weather-panel.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="search-header">
    <h1>Clima</h1>
    <form id="city-search" role="search">
      <label for="city-input">Buscar cidade</label>
      <input id="city-input" name="city" type="search" autocomplete="off" required>
      <button type="submit">Buscar</button>
    </form>
  </header>

  <main id="weather-main">
    <p id="app-status" role="status" aria-live="polite">
      Pesquise uma cidade para ver o clima atual.
    </p>
    <button id="retry-search" type="button" hidden>
      Tentar novamente
    </button>
    <form id="city-choice" hidden>
      <label for="city-choice-select">Encontramos mais de uma cidade:</label>
      <select id="city-choice-select" name="location" required></select>
      <button type="submit">Consultar cidade selecionada</button>
    </form>
    <section id="weather-result" aria-label="Clima atual" hidden></section>
  </main>
`

const searchForm = document.querySelector<HTMLFormElement>('#city-search')!
const cityInput = document.querySelector<HTMLInputElement>('#city-input')!
const searchButton =
  searchForm.querySelector<HTMLButtonElement>('button[type="submit"]')!
const appStatus = document.querySelector<HTMLParagraphElement>('#app-status')!
const retryButton =
  document.querySelector<HTMLButtonElement>('#retry-search')!
const cityChoiceForm =
  document.querySelector<HTMLFormElement>('#city-choice')!
const cityChoiceSelect =
  document.querySelector<HTMLSelectElement>('#city-choice-select')!
const cityChoiceButton =
  cityChoiceForm.querySelector<HTMLButtonElement>('button[type="submit"]')!
const weatherMain = document.querySelector<HTMLElement>('#weather-main')!
const weatherResult =
  document.querySelector<HTMLElement>('#weather-result')!
let isSearching = false
let lastSearchedCity = ''
let focusedSearchControl: HTMLElement | null = null
let pendingLocations: GeocodingLocation[] = []

function setSearchInProgress(inProgress: boolean): void {
  if (inProgress) {
    const activeElement = document.activeElement
    focusedSearchControl =
      activeElement instanceof HTMLElement &&
      (activeElement === cityInput || activeElement === searchButton)
        ? activeElement
        : null
  }

  isSearching = inProgress
  cityInput.disabled = inProgress
  searchButton.disabled = inProgress
  cityChoiceSelect.disabled = inProgress
  cityChoiceButton.disabled = inProgress
  weatherMain.setAttribute('aria-busy', String(inProgress))
  if (inProgress) {
    retryButton.hidden = true
  } else if (focusedSearchControl !== null) {
    focusedSearchControl.focus()
    focusedSearchControl = null
  }
}

function showCityChoices(locations: GeocodingLocation[]): void {
  pendingLocations = locations
  cityChoiceSelect.replaceChildren()

  for (const [index, location] of locations.entries()) {
    const option = document.createElement('option')
    option.value = String(index)
    option.textContent = [
      location.name,
      location.admin1,
      location.country ?? location.country_code,
    ]
      .filter((part) => part !== undefined)
      .join(', ')
    cityChoiceSelect.append(option)
  }

  cityChoiceForm.hidden = false
}

async function displayWeatherForLocation(
  location: GeocodingLocation,
  searchedCity: string,
): Promise<void> {
  const result = await getCityWeather(location)
  if (result === null) {
    appStatus.textContent =
      `Nenhum resultado encontrado para "${searchedCity}".`
    return
  }

  renderWeatherPanel(weatherResult, result)
  appStatus.textContent = `Clima encontrado para ${result.location.name}.`
}

async function performSearch(city: string): Promise<void> {
  if (isSearching) return
  const normalizedCity = city.trim()
  if (normalizedCity.length === 0) {
    appStatus.textContent = 'Digite o nome de uma cidade para pesquisar.'
    return
  }

  lastSearchedCity = normalizedCity
  pendingLocations = []
  cityChoiceForm.hidden = true
  weatherResult.replaceChildren()
  weatherResult.hidden = true
  setSearchInProgress(true)
  appStatus.textContent = `Buscando o clima de "${normalizedCity}"...`

  try {
    const locations = await findCityLocations(normalizedCity)
    if (locations === null || locations.length === 0) {
      appStatus.textContent =
        `Nenhum resultado encontrado para "${normalizedCity}".`
      return
    }

    if (locations.length > 1) {
      showCityChoices(locations)
      appStatus.textContent =
        `Encontramos ${locations.length} cidades correspondentes. ` +
        'Escolha uma para consultar o clima.'
      return
    }

    await displayWeatherForLocation(locations[0], normalizedCity)
  } catch (error) {
    console.error('Falha ao pesquisar o clima.', error)
    appStatus.textContent =
      `Não foi possível consultar o clima de "${normalizedCity}". ` +
      'Verifique sua conexão e tente novamente.'
    retryButton.hidden = false
  } finally {
    setSearchInProgress(false)
    if (!cityChoiceForm.hidden) cityChoiceSelect.focus()
  }
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  void performSearch(cityInput.value)
})

retryButton.addEventListener('click', () => {
  void performSearch(lastSearchedCity)
})

cityChoiceForm.addEventListener('submit', (event) => {
  event.preventDefault()
  if (isSearching) return

  const selectedIndex = Number(cityChoiceSelect.value)
  const location = pendingLocations[selectedIndex]
  if (!Number.isInteger(selectedIndex) || location === undefined) {
    appStatus.textContent = 'Selecione uma cidade válida para continuar.'
    return
  }

  cityChoiceForm.hidden = true
  weatherResult.replaceChildren()
  weatherResult.hidden = true
  setSearchInProgress(true)
  appStatus.textContent = `Buscando o clima de ${location.name}...`

  void displayWeatherForLocation(location, lastSearchedCity)
    .catch((error: unknown) => {
      console.error('Falha ao pesquisar o clima.', error)
      appStatus.textContent =
        `Não foi possível consultar o clima de "${lastSearchedCity}". ` +
        'Verifique sua conexão e tente novamente.'
      retryButton.hidden = false
    })
    .finally(() => {
      setSearchInProgress(false)
    })
})
