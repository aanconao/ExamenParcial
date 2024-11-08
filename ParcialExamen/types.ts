import { ObjectId, OptionalId } from "mongodb";

export type Autores = {
  id: string;
  nombre: string;
  biografia: string;
};

export type AutoresModel = OptionalId<{
  _id: ObjectId;
  nombre: string;
  biografia: string;
}>;

export type Libro = {
  id: string;
  titulo: string;
  copiasDisponibles: number;
  autor: Autores[];
};

export type LibroModel = OptionalId<{
  _id: ObjectId;
  titulo: string;
  copiasDisponibles: number;
  autor: ObjectId[];
}>;
