import { request } from './request';

export type PetType = 'CAT' | 'DOG' | 'OTHER';
export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface Pet {
  id: string;
  ownerId: string;
  avatar: string | null;
  name: string;
  type: PetType;
  breed: string | null;
  gender: PetGender;
  birthday: string | null;
  weight: number | null;
  note: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PetPayload {
  name: string;
  type: PetType;
  breed?: string;
  gender?: PetGender;
  birthday?: string;
  weight?: number;
  avatar?: string;
  note?: string;
}

export function listMyPets() {
  return request<Pet[]>({ url: '/pet' });
}

export function getPet(id: string) {
  return request<Pet>({ url: `/pet/${id}` });
}

export function createPet(data: PetPayload) {
  return request<Pet>({
    url: '/pet',
    method: 'POST',
    data: data as unknown as Record<string, unknown>,
  });
}

export function updatePet(id: string, data: Partial<PetPayload>) {
  return request<Pet>({
    url: `/pet/${id}`,
    method: 'PUT',
    data: data as unknown as Record<string, unknown>,
  });
}

export function deletePet(id: string) {
  return request<{ success: boolean }>({ url: `/pet/${id}`, method: 'DELETE' });
}

export function listBreeds(type: PetType) {
  return request<string[]>({ url: `/breed/${type}`, skipAuth: true });
}
