import {
  validateGeocodingResponse,
  validateWeatherResponse,
  type GeocodingLocation,
  type WeatherResponse,
} from '../types/open-meteo.ts'

const GEOCODING_ENDPOINT =
  'https://geocoding-api.open-meteo.com/v1/search'
const GEOCODING_RESULT_LIMIT = '10'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'
const WEATHER_CURRENT_VARIABLES =
  'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,weather_code'

export async function geocodeCity(
  city: string | null | undefined,
): Promise<GeocodingLocation[] | null> {
  if (typeof city !== 'string') return null
  const name = city.trim()
  if (name.length === 0) return null

  const parameters = new URLSearchParams({
    name,
    count: GEOCODING_RESULT_LIMIT,
    language: 'pt',
    format: 'json',
  })

  let response: Response
  try {
    response = await fetch(`${GEOCODING_ENDPOINT}?${parameters.toString()}`)
  } catch (error) {
    throw new Error('Falha de rede ao consultar a geocodificação.', {
      cause: error,
    })
  }

  if (!response.ok) {
    throw new Error(
      `Falha HTTP ao consultar a geocodificação: ${response.status} ${response.statusText}`.trim(),
    )
  }

  let body: string
  try {
    body = await response.text()
  } catch (error) {
    throw new Error('Falha de rede ao ler a resposta de geocodificação.', {
      cause: error,
    })
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch (error) {
    throw new Error('A resposta de geocodificação contém JSON inválido.', {
      cause: error,
    })
  }

  return validateGeocodingResponse(payload)
}

export async function getWeather(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  timezone: string | null | undefined,
): Promise<WeatherResponse | null> {
  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    typeof timezone !== 'string' ||
    timezone.trim().length === 0
  ) {
    return null
  }

  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: timezone.trim(),
    current: WEATHER_CURRENT_VARIABLES,
    hourly: 'precipitation_probability',
  })

  let response: Response
  try {
    response = await fetch(`${FORECAST_ENDPOINT}?${parameters.toString()}`)
  } catch (error) {
    throw new Error('Falha de rede ao consultar o clima.', { cause: error })
  }

  if (!response.ok) {
    throw new Error(
      `Falha HTTP ao consultar o clima: ${response.status} ${response.statusText}`.trim(),
    )
  }

  let body: string
  try {
    body = await response.text()
  } catch (error) {
    throw new Error('Falha de rede ao ler a resposta do clima.', {
      cause: error,
    })
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch (error) {
    throw new Error('A resposta do clima contém JSON inválido.', {
      cause: error,
    })
  }

  return validateWeatherResponse(payload)
}

export function getCurrentPrecipitationProbability(
  weather: WeatherResponse,
): number | null {
  const currentTime = weather.current.time
  if (
    typeof currentTime !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(currentTime)
  ) {
    return null
  }

  const currentHour = currentTime.slice(0, 13)
  const index = weather.hourly.time.findIndex(
    (time) => time.slice(0, 13) === currentHour,
  )
  if (index === -1) return null

  const probability = weather.hourly.precipitation_probability[index]
  return typeof probability === 'number' &&
    Number.isFinite(probability) &&
    probability >= 0 &&
    probability <= 100
    ? probability
    : null
}
