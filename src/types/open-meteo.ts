export interface GeocodingLocation {
  name: string
  latitude: number
  longitude: number
  country_code: string
  timezone: string
  admin1?: string
  country?: string
}

export interface WeatherCurrent {
  time: string
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: 0 | 1
  wind_speed_10m: number
  wind_direction_10m: number
  weather_code: number
}

export interface WeatherHourly {
  time: string[]
  precipitation_probability: number[]
}

export interface WeatherCurrentUnits {
  time?: string
  temperature_2m?: string
  relative_humidity_2m?: string
  apparent_temperature?: string
  is_day?: string
  wind_speed_10m?: string
  wind_direction_10m?: string
  weather_code?: string
}

export interface WeatherHourlyUnits {
  time?: string
  precipitation_probability?: string
}

export interface WeatherResponse {
  current: WeatherCurrent
  current_units?: WeatherCurrentUnits
  hourly: WeatherHourly
  hourly_units?: WeatherHourlyUnits
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isWithin(value: number, minimum: number, maximum: number): boolean {
  return value >= minimum && value <= maximum
}

function optionalUnit(
  units: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = units[field]
  return typeof value === 'string' ? value : undefined
}

function validateUnitFields(
  units: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  return fields.every((field) => {
    const value = units[field]
    return value === undefined || typeof value === 'string'
  })
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null

  const items: unknown[] = value
  const parsed: string[] = []
  for (const item of items) {
    if (!isNonEmptyString(item)) return null
    parsed.push(item)
  }
  return parsed
}

function parseProbabilityArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null

  const items: unknown[] = value
  const parsed: number[] = []
  for (const item of items) {
    if (!isFiniteNumber(item) || !isWithin(item, 0, 100)) return null
    parsed.push(item)
  }
  return parsed
}

function validateCurrentUnits(value: unknown):
  | WeatherCurrentUnits
  | undefined
  | null {
  if (value === undefined) return undefined
  if (!isRecord(value)) return null

  const fields = [
    'time',
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'wind_speed_10m',
    'wind_direction_10m',
    'weather_code',
  ]
  if (!validateUnitFields(value, fields)) return null

  return {
    time: optionalUnit(value, 'time'),
    temperature_2m: optionalUnit(value, 'temperature_2m'),
    relative_humidity_2m: optionalUnit(value, 'relative_humidity_2m'),
    apparent_temperature: optionalUnit(value, 'apparent_temperature'),
    is_day: optionalUnit(value, 'is_day'),
    wind_speed_10m: optionalUnit(value, 'wind_speed_10m'),
    wind_direction_10m: optionalUnit(value, 'wind_direction_10m'),
    weather_code: optionalUnit(value, 'weather_code'),
  }
}

function validateHourlyUnits(value: unknown):
  | WeatherHourlyUnits
  | undefined
  | null {
  if (value === undefined) return undefined
  if (!isRecord(value)) return null

  const fields = ['time', 'precipitation_probability']
  if (!validateUnitFields(value, fields)) return null

  return {
    time: optionalUnit(value, 'time'),
    precipitation_probability: optionalUnit(
      value,
      'precipitation_probability',
    ),
  }
}

export function validateGeocodingResponse(
  value: unknown,
): GeocodingLocation[] | null {
  if (!isRecord(value) || !Array.isArray(value.results)) return null

  const locations: GeocodingLocation[] = []
  for (const result of value.results) {
    if (!isRecord(result)) continue

    const { name, latitude, longitude, country_code, timezone, admin1, country } =
      result
    if (
      !isNonEmptyString(name) ||
      !isFiniteNumber(latitude) ||
      !isWithin(latitude, -90, 90) ||
      !isFiniteNumber(longitude) ||
      !isWithin(longitude, -180, 180) ||
      !isNonEmptyString(country_code) ||
      !isNonEmptyString(timezone) ||
      (admin1 !== undefined && typeof admin1 !== 'string') ||
      (country !== undefined && typeof country !== 'string')
    ) {
      continue
    }

    locations.push({
      name,
      latitude,
      longitude,
      country_code,
      timezone,
      ...(typeof admin1 === 'string' && admin1.length > 0 ? { admin1 } : {}),
      ...(typeof country === 'string' && country.length > 0 ? { country } : {}),
    })
  }

  return locations
}

export function validateWeatherResponse(
  value: unknown,
): WeatherResponse | null {
  if (!isRecord(value) || !isRecord(value.current) || !isRecord(value.hourly)) {
    return null
  }

  const current = value.current
  const {
    time,
    temperature_2m,
    relative_humidity_2m,
    apparent_temperature,
    is_day,
    wind_speed_10m,
    wind_direction_10m,
    weather_code,
  } = current

  if (
    !isNonEmptyString(time) ||
    !isFiniteNumber(temperature_2m) ||
    !isFiniteNumber(relative_humidity_2m) ||
    !isWithin(relative_humidity_2m, 0, 100) ||
    !isFiniteNumber(apparent_temperature) ||
    (is_day !== 0 && is_day !== 1) ||
    !isFiniteNumber(wind_speed_10m) ||
    wind_speed_10m < 0 ||
    !isFiniteNumber(wind_direction_10m) ||
    !isWithin(wind_direction_10m, 0, 360) ||
    !isFiniteNumber(weather_code) ||
    !Number.isInteger(weather_code) ||
    weather_code < 0
  ) {
    return null
  }

  const hourlyTimes = parseStringArray(value.hourly.time)
  const precipitationProbability = parseProbabilityArray(
    value.hourly.precipitation_probability,
  )
  if (
    hourlyTimes === null ||
    precipitationProbability === null ||
    hourlyTimes.length === 0 ||
    hourlyTimes.length !== precipitationProbability.length
  ) {
    return null
  }

  const currentUnits = validateCurrentUnits(value.current_units)
  const hourlyUnits = validateHourlyUnits(value.hourly_units)
  if (currentUnits === null || hourlyUnits === null) return null

  return {
    current: {
      time,
      temperature_2m,
      relative_humidity_2m,
      apparent_temperature,
      is_day,
      wind_speed_10m,
      wind_direction_10m,
      weather_code,
    },
    ...(currentUnits === undefined ? {} : { current_units: currentUnits }),
    hourly: {
      time: hourlyTimes,
      precipitation_probability: precipitationProbability,
    },
    ...(hourlyUnits === undefined ? {} : { hourly_units: hourlyUnits }),
  }
}
