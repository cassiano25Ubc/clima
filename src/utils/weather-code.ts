export type WmoWeatherCode =
  | 0
  | 1
  | 2
  | 3
  | 45
  | 48
  | 51
  | 53
  | 55
  | 56
  | 57
  | 61
  | 63
  | 65
  | 66
  | 67
  | 71
  | 73
  | 75
  | 77
  | 80
  | 81
  | 82
  | 85
  | 86
  | 95
  | 96
  | 99

const WEATHER_DESCRIPTIONS: Record<WmoWeatherCode, string> = {
  0: 'Céu limpo',
  1: 'Parcialmente nublado',
  2: 'Nublado',
  3: 'Encoberto',
  45: 'Nevoeiro',
  48: 'Nevoeiro com depósito de geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa densa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante densa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',
  71: 'Queda de neve leve',
  73: 'Queda de neve moderada',
  75: 'Queda de neve intensa',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Trovoadas leves ou moderadas',
  96: 'Trovoadas com granizo leve',
  99: 'Trovoadas com granizo forte',
}

const UNKNOWN_WEATHER_DESCRIPTION = 'Condição meteorológica indisponível'

export function describeWeatherCode(code: number): string {
  if (Object.hasOwn(WEATHER_DESCRIPTIONS, code)) {
    return WEATHER_DESCRIPTIONS[code as WmoWeatherCode]
  }

  return UNKNOWN_WEATHER_DESCRIPTION
}
