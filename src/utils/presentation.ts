import type {
  WeatherCurrentUnits,
  WeatherHourlyUnits,
} from '../types/open-meteo.ts'

export type CurrentWeatherValueField =
  | 'temperature_2m'
  | 'relative_humidity_2m'
  | 'apparent_temperature'
  | 'wind_speed_10m'
  | 'wind_direction_10m'

export type HourlyWeatherValueField = 'precipitation_probability'

interface DateTimeParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

const ISO_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?)?$/

function utcTimestamp(parts: DateTimeParts): number {
  const date = new Date(0)
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day)
  date.setUTCHours(
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  )
  return date.getTime()
}

function readParts(formatter: Intl.DateTimeFormat, date: Date): DateTimeParts {
  const fields = new Map(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )

  return {
    year: fields.get('year')!,
    month: fields.get('month')!,
    day: fields.get('day')!,
    hour: fields.get('hour')!,
    minute: fields.get('minute')!,
    second: fields.get('second')!,
    millisecond: date.getUTCMilliseconds(),
  }
}

function createTimeZoneFormatter(timeZone: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
  } catch (error) {
    throw new RangeError(`Timezone IANA inválida: "${timeZone}".`, {
      cause: error,
    })
  }
}

function parseLocalDateTime(value: string): {
  parts: DateTimeParts
  offset: string | undefined
} {
  const match = ISO_DATE_PATTERN.exec(value)
  if (match === null) {
    throw new RangeError(`Data inválida para apresentação: "${value}".`)
  }

  const [, year, month, day, hour, minute, second, fraction, offset] = match
  const parts: DateTimeParts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: hour === undefined ? 12 : Number(hour),
    minute: minute === undefined ? 0 : Number(minute),
    second: second === undefined ? 0 : Number(second),
    millisecond:
      fraction === undefined ? 0 : Number(fraction.padEnd(3, '0')),
  }
  const timestamp = utcTimestamp(parts)
  const normalized = new Date(timestamp)

  if (
    !Number.isFinite(timestamp) ||
    normalized.getUTCFullYear() !== parts.year ||
    normalized.getUTCMonth() + 1 !== parts.month ||
    normalized.getUTCDate() !== parts.day ||
    parts.hour > 23 ||
    parts.minute > 59 ||
    parts.second > 59
  ) {
    throw new RangeError(`Data inválida para apresentação: "${value}".`)
  }

  return { parts, offset }
}

function localTimeInZone(
  parts: DateTimeParts,
  timeZone: string,
  formatter: Intl.DateTimeFormat,
): Date {
  const targetTimestamp = utcTimestamp(parts)
  let timestamp = targetTimestamp

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const zonedParts = readParts(formatter, new Date(timestamp))
    const difference = targetTimestamp - utcTimestamp(zonedParts)
    timestamp += difference
    if (difference === 0) break
  }

  const result = new Date(timestamp)
  const resultParts = readParts(formatter, result)
  if (
    resultParts.year !== parts.year ||
    resultParts.month !== parts.month ||
    resultParts.day !== parts.day ||
    resultParts.hour !== parts.hour ||
    resultParts.minute !== parts.minute ||
    resultParts.second !== parts.second
  ) {
    throw new RangeError(
      `O horário informado não existe na timezone "${timeZone}".`,
    )
  }

  return result
}

export function formatLocalDate(
  dateTime: string,
  timeZone: string,
): string {
  const zoneFormatter = createTimeZoneFormatter(timeZone)
  const { parts, offset } = parseLocalDateTime(dateTime)
  const date =
    offset === undefined
      ? localTimeInZone(parts, timeZone, zoneFormatter)
      : new Date(dateTime)

  if (!Number.isFinite(date.getTime())) {
    throw new RangeError(`Data inválida para apresentação: "${dateTime}".`)
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeZone,
  }).format(date)
}

function formatValue(value: number, unit: string | undefined): string {
  if (!Number.isFinite(value)) {
    throw new RangeError('O valor meteorológico precisa ser finito.')
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 20,
  }).format(value)
  if (unit === undefined) return formattedValue
  if (unit.trim().length === 0) {
    throw new RangeError('A unidade meteorológica não pode estar vazia.')
  }

  return `${formattedValue} ${unit.trim()}`
}

export function formatCurrentWeatherValue(
  value: number,
  field: CurrentWeatherValueField,
  units: WeatherCurrentUnits | undefined,
): string {
  return formatValue(value, units?.[field])
}

export function formatHourlyWeatherValue(
  value: number,
  field: HourlyWeatherValueField,
  units: WeatherHourlyUnits | undefined,
): string {
  return formatValue(value, units?.[field])
}
