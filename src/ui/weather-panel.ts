import type { CityWeatherResult } from '../services/city-weather.ts'
import {
  formatCurrentWeatherValue,
  formatHourlyWeatherValue,
  formatLocalDate,
} from '../utils/presentation.ts'
import { describeWeatherCode } from '../utils/weather-code.ts'

type WeatherIconName = 'thermometer' | 'humidity' | 'rain' | 'wind' | 'compass'

const WEATHER_ICON_PATHS: Record<WeatherIconName, string[]> = {
  thermometer: [
    'M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z',
    'M12 11v6',
  ],
  humidity: [
    'M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z',
    'M9 16a3 3 0 0 0 3 3',
  ],
  rain: [
    'M20 16.2A4.5 4.5 0 0 0 18 7.5 6 6 0 0 0 6.3 9 4 4 0 0 0 6 17h14',
    'm8 19-1 2',
    'm13 19-1 2',
    'm18 19-1 2',
  ],
  wind: [
    'M3 8h12a3 3 0 1 0-3-3',
    'M2 12h17a3 3 0 1 1-3 3',
    'M4 16h5',
  ],
  compass: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    'm16.2 7.8-2.8 6.4-6.4 2.8 2.8-6.4 6.4-2.8Z',
  ],
}

function createWeatherIcon(name: WeatherIconName): SVGSVGElement {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.classList.add('weather-icon')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('fill', 'none')
  icon.setAttribute('stroke', 'currentColor')
  icon.setAttribute('stroke-width', '1.8')
  icon.setAttribute('stroke-linecap', 'round')
  icon.setAttribute('stroke-linejoin', 'round')
  icon.setAttribute('aria-hidden', 'true')
  icon.setAttribute('focusable', 'false')

  for (const pathData of WEATHER_ICON_PATHS[name]) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData)
    icon.append(path)
  }

  return icon
}

function createMetric(
  label: string,
  value: string,
  iconName: WeatherIconName,
): HTMLElement {
  const container = document.createElement('div')
  container.className = 'weather-metric'

  const term = document.createElement('dt')
  term.textContent = label
  term.prepend(createWeatherIcon(iconName))
  const description = document.createElement('dd')
  description.textContent = value

  container.append(term, description)
  return container
}

export function renderWeatherPanel(
  container: HTMLElement,
  result: CityWeatherResult,
): void {
  const { location, weather, precipitationProbability } = result
  const { current, current_units: currentUnits, hourly_units: hourlyUnits } =
    weather
  const panel = document.createElement('div')
  panel.className = 'weather-panel'

  const summary = document.createElement('aside')
  summary.className = 'weather-summary'
  summary.setAttribute('aria-label', 'Resumo do clima')

  const temperature = document.createElement('p')
  temperature.className = 'weather-temperature'
  temperature.append(createWeatherIcon('thermometer'))
  temperature.append(
    document.createTextNode(
      formatCurrentWeatherValue(
        current.temperature_2m,
        'temperature_2m',
        currentUnits,
      ),
    ),
  )

  const city = document.createElement('h2')
  city.textContent = `${location.name}, ${location.country_code}`

  const localDate = document.createElement('p')
  localDate.className = 'weather-date'
  localDate.textContent = formatLocalDate(current.time, location.timezone)

  const dayPeriod = document.createElement('p')
  dayPeriod.className = 'weather-day-period'
  dayPeriod.textContent = current.is_day === 1 ? 'Dia' : 'Noite'

  const condition = document.createElement('p')
  condition.className = 'weather-condition'
  condition.textContent = describeWeatherCode(current.weather_code)

  summary.append(temperature, city, localDate, dayPeriod, condition)

  const details = document.createElement('section')
  details.className = 'weather-details'
  details.setAttribute('aria-label', 'Detalhes do clima')

  const metrics = document.createElement('dl')
  metrics.className = 'weather-metrics'
  metrics.append(
    createMetric(
      'Umidade relativa',
      formatCurrentWeatherValue(
        current.relative_humidity_2m,
        'relative_humidity_2m',
        currentUnits,
      ),
      'humidity',
    ),
    createMetric(
      'Temperatura aparente',
      formatCurrentWeatherValue(
        current.apparent_temperature,
        'apparent_temperature',
        currentUnits,
      ),
      'thermometer',
    ),
    createMetric(
      'Probabilidade de precipitação',
      formatHourlyWeatherValue(
        precipitationProbability,
        'precipitation_probability',
        hourlyUnits,
      ),
      'rain',
    ),
    createMetric(
      'Velocidade do vento',
      formatCurrentWeatherValue(
        current.wind_speed_10m,
        'wind_speed_10m',
        currentUnits,
      ),
      'wind',
    ),
    createMetric(
      'Direção do vento',
      formatCurrentWeatherValue(
        current.wind_direction_10m,
        'wind_direction_10m',
        currentUnits,
      ),
      'compass',
    ),
  )
  details.append(metrics)
  panel.append(summary, details)

  container.replaceChildren(panel)
  container.hidden = false
}
