import {
  geocodeCity,
  getCurrentPrecipitationProbability,
  getWeather,
} from './open-meteo.ts'
import type { GeocodingLocation, WeatherResponse } from '../types/open-meteo.ts'

export interface CityWeatherResult {
  location: GeocodingLocation
  weather: WeatherResponse
  precipitationProbability: number
}

export async function findCityLocations(
  city: string | null | undefined,
): Promise<GeocodingLocation[] | null> {
  if (typeof city !== 'string' || city.trim().length === 0) return null
  return geocodeCity(city)
}

export async function getCityWeather(
  location: GeocodingLocation,
): Promise<CityWeatherResult | null> {
  const weather = await getWeather(
    location.latitude,
    location.longitude,
    location.timezone,
  )
  if (weather === null) return null

  const precipitationProbability =
    getCurrentPrecipitationProbability(weather)
  if (precipitationProbability === null) return null

  return { location, weather, precipitationProbability }
}
