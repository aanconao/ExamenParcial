import { Collection } from "mongodb";
import { Autores, AutoresModel, Libro, LibroModel } from "./types.ts";

export const fromModelToAutores = (modelAutores: AutoresModel): Autores => ({
  id: modelAutores._id!.toString(),
  nombre: modelAutores.nombre,
  biografia: modelAutores.biografia,
});

export const fromModelToLibro = async (
  modelLibro: LibroModel,
  autoresCollection: Collection<AutoresModel>
): Promise<Libro> => {
  const autores = await autoresCollection
    .find({ _id: { $in: modelLibro.autor } })
    .toArray();
  return {
    id: modelLibro._id!.toString(),
    titulo: modelLibro.titulo,
    copiasDisponibles: modelLibro.copiasDisponibles,
    autor: autores.map((p) => fromModelToAutores(p)),
  };
};
