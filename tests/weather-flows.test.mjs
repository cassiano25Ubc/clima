import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  geocodeCity,
  getCurrentPrecipitationProbability,
  getWeather,
} from '../src/services/open-meteo.ts'
import {
  findCityLocations,
  getCityWeather,
} from '../src/services/city-weather.ts'
import { validateWeatherResponse } from '../src/types/open-meteo.ts'
import { formatLocalDate } from '../src/utils/presentation.ts'
import { describeWeatherCode } from '../src/utils/weather-code.ts'

const originalFetch = globalThis.fetch

const location = {
  name: 'Sao Paulo',
  latitude: -23.55,
  longitude: -46.63,
  country_code: 'BR',
  timezone: 'America/Sao_Paulo',
}

function createWeatherResponse(overrides = {}) {
  return {
    current: {
      time: '2026-10-05T16:00',
      temperature_2m: 22.5,
      relative_humidity_2m: 70,
      apparent_temperature: 24,
      is_day: 1,
      wind_speed_10m: 8.2,
      wind_direction_10m: 180,
      weather_code: 61,
    },
    current_units: {
      temperature_2m: '°C',
      relative_humidity_2m: '%',
      apparent_temperature: '°C',
      wind_speed_10m: 'km/h',
      wind_direction_10m: '°',
    },
    hourly: {
      time: ['2026-10-05T15:00', '2026-10-05T16:00'],
      precipitation_probability: [10, 65],
    },
    hourly_units: { precipitation_probability: '%' },
    ...overrides,
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('geocoding encodes city name and sends required parameters', async () => {
  let requestUrl
  globalThis.fetch = async (input) => {
    requestUrl = new URL(String(input))
    return jsonResponse({ results: [location] })
  }

  const result = await geocodeCity('  Sao Paulo  ')

  assert.equal(result?.[0]?.country_code, 'BR')
  assert.equal(requestUrl.pathname, '/v1/search')
  assert.equal(requestUrl.searchParams.get('name'), 'Sao Paulo')
  assert.equal(requestUrl.searchParams.get('count'), '10')
  assert.equal(requestUrl.searchParams.get('language'), 'pt')
  assert.equal(requestUrl.searchParams.get('format'), 'json')
})

test('geocoding returns multiple candidates with location context', async () => {
  let requestUrl
  globalThis.fetch = async (input) => {
    requestUrl = new URL(String(input))
    return jsonResponse({
      results: [
        {
          ...location,
          name: 'Nova Iorque',
          country: 'Estados Unidos',
          admin1: 'Nova Iorque',
        },
        {
          ...location,
          name: 'Nova Iorque',
          country_code: 'BR',
          country: 'Brasil',
          admin1: 'Maranhao',
        },
      ],
    })
  }

  const results = await geocodeCity('Nova York')

  assert.equal(results.length, 2)
  assert.equal(results[0].country, 'Estados Unidos')
  assert.equal(results[1].country_code, 'BR')
  assert.equal(requestUrl.searchParams.get('count'), '10')
})

test('blank city makes no request and no city result stops before forecast', async () => {
  let requestCount = 0
  globalThis.fetch = async () => {
    requestCount += 1
    return jsonResponse({ results: [] })
  }

  assert.equal(await findCityLocations('  '), null)
  assert.equal(requestCount, 0)
  assert.deepEqual(await findCityLocations('Cidade inexistente'), [])
  assert.equal(requestCount, 1)
})

test('city lookup requests candidates and forecast uses the selected location', async () => {
  const requests = []
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    requests.push(url)
    return url.hostname.startsWith('geocoding')
      ? jsonResponse({ results: [location] })
      : jsonResponse(createWeatherResponse())
  }

  const locations = await findCityLocations('Sao Paulo')
  const result = await getCityWeather(locations[0])

  assert.equal(requests.length, 2)
  assert.equal(requests[0].hostname, 'geocoding-api.open-meteo.com')
  assert.equal(requests[0].searchParams.get('count'), '10')
  assert.equal(requests[1].pathname, '/v1/forecast')
  assert.equal(requests[1].searchParams.get('latitude'), String(location.latitude))
  assert.equal(requests[1].searchParams.get('longitude'), String(location.longitude))
  assert.equal(requests[1].searchParams.get('timezone'), location.timezone)
  assert.equal(
    requests[1].searchParams.get('current'),
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,weather_code',
  )
  assert.equal(
    requests[1].searchParams.get('hourly'),
    'precipitation_probability',
  )
  assert.equal(result?.precipitationProbability, 65)
})

test('forecast uses the chosen candidate when a city name is ambiguous', async () => {
  const chosenLocation = {
    ...location,
    name: 'Nova Iorque',
    latitude: 40.71427,
    longitude: -74.00597,
    country_code: 'US',
    timezone: 'America/New_York',
    admin1: 'Nova Iorque',
    country: 'EUA',
  }
  let forecastUrl
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    if (url.hostname.startsWith('geocoding')) {
      return jsonResponse({
        results: [location, chosenLocation],
      })
    }
    forecastUrl = url
    return jsonResponse(createWeatherResponse())
  }

  const candidates = await findCityLocations('Nova Iorque')
  const result = await getCityWeather(candidates[1])

  assert.equal(result?.location.country_code, 'US')
  assert.equal(forecastUrl.searchParams.get('latitude'), '40.71427')
  assert.equal(forecastUrl.searchParams.get('longitude'), '-74.00597')
  assert.equal(
    forecastUrl.searchParams.get('timezone'),
    'America/New_York',
  )
})

test('incomplete weather data returns no result and never renders a success-shaped value', async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    return url.hostname.startsWith('geocoding')
      ? jsonResponse({ results: [location] })
      : jsonResponse(
          createWeatherResponse({
            hourly: { time: ['2026-10-05T15:00'], precipitation_probability: [10] },
          }),
        )
  }

  const locations = await findCityLocations('Sao Paulo')
  assert.equal(await getCityWeather(locations[0]), null)

  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    return url.hostname.startsWith('geocoding')
      ? jsonResponse({ results: [location] })
      : jsonResponse({
          ...createWeatherResponse(),
          current: {
            ...createWeatherResponse().current,
            relative_humidity_2m: 150,
          },
        })
  }
  const nextLocations = await findCityLocations('Sao Paulo')
  assert.equal(await getCityWeather(nextLocations[0]), null)
})

test('network and HTTP failures are errors and a repeated search can recover', async () => {
  let shouldFail = true
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    if (url.hostname.startsWith('geocoding') && shouldFail) {
      shouldFail = false
      return jsonResponse({}, 503)
    }
    return url.hostname.startsWith('geocoding')
      ? jsonResponse({ results: [location] })
      : jsonResponse(createWeatherResponse())
  }

  await assert.rejects(() => findCityLocations('Sao Paulo'), /Falha HTTP/)
  const locations = await findCityLocations('Sao Paulo')
  assert.equal(
    (await getCityWeather(locations[0]))?.precipitationProbability,
    65,
  )

  globalThis.fetch = async () => {
    throw new Error('offline')
  }
  await assert.rejects(() => geocodeCity('Sao Paulo'), /Falha de rede/)
})

test('missing weather parameters do not make a forecast request', async () => {
  let requestCount = 0
  globalThis.fetch = async () => {
    requestCount += 1
    return jsonResponse(createWeatherResponse())
  }

  assert.equal(await getWeather(undefined, location.longitude, location.timezone), null)
  assert.equal(await getWeather(location.latitude, location.longitude, ''), null)
  assert.equal(requestCount, 0)
})

test('accepts Open-Meteo unit fields that are intentionally empty', () => {
  const response = createWeatherResponse({
    current_units: {
      time: 'iso8601',
      temperature_2m: '°C',
      relative_humidity_2m: '%',
      apparent_temperature: '°C',
      is_day: '',
      wind_speed_10m: 'km/h',
      wind_direction_10m: '°',
      weather_code: 'wmo code',
    },
  })

  assert.notEqual(validateWeatherResponse(response), null)
})

test('precipitation probability matches the current local hour', () => {
  const weather = createWeatherResponse({
    current: {
      ...createWeatherResponse().current,
      time: '2026-10-05T16:15',
    },
  })
  assert.equal(getCurrentPrecipitationProbability(weather), 65)
  assert.equal(
    getCurrentPrecipitationProbability({
      ...weather,
      current: { ...weather.current, time: '2026-10-05T17:00' },
    }),
    null,
  )
  assert.equal(
    getCurrentPrecipitationProbability({
      ...weather,
      hourly: { time: weather.hourly.time, precipitation_probability: [10] },
    }),
    null,
  )
})

test('local date formatting uses the supplied timezone and rejects invalid inputs', () => {
  assert.match(
    formatLocalDate('2026-10-05T00:30Z', 'America/Sao_Paulo'),
    /domingo, 4 de outubro de 2026/,
  )
  assert.match(
    formatLocalDate('2026-10-05T16:00', 'America/Sao_Paulo'),
    /segunda-feira, 5 de outubro de 2026/,
  )
  assert.throws(
    () => formatLocalDate('2026-02-30', 'America/Sao_Paulo'),
    RangeError,
  )
  assert.throws(
    () => formatLocalDate('2026-10-05', 'Invalid/Zone'),
    RangeError,
  )
})

test('all documented WMO codes have descriptions and unknown codes use fallback', () => {
  const expectedCodes = [
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75,
    77, 80, 81, 82, 85, 86, 95, 96, 99,
  ]

  for (const code of expectedCodes) {
    assert.notEqual(
      describeWeatherCode(code),
      'Condição meteorológica indisponível',
      `WMO code ${code} should have a description`,
    )
  }
  assert.equal(
    describeWeatherCode(999),
    'Condição meteorológica indisponível',
  )
})
