import axios from 'axios';

/** Shared Axios instance for every PokeAPI request. */
export const pokeApi = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 12000,
});

/** Turns any thrown value (Axios or otherwise) into a readable message. */
export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 404) return 'That Pokémon could not be found.';
    if (err.response?.status === 429) return 'PokeAPI is rate-limiting requests. Please wait a moment and retry.';
    if (err.code === 'ECONNABORTED') return 'The request to PokeAPI timed out.';
    if (!err.response) return 'Could not reach PokeAPI. Check your connection.';
    return `PokeAPI responded with an error (${err.response.status}).`;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}
