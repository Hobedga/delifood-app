export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  breed: string;
  species:string;
  color: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}