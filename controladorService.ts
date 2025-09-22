import { Injectable, signal, computed, WritableSignal, Signal, inject } from '@angular/core';
import { StatesEnum } from '../enums/states.enum';
import { WriteService } from './write.service';
import { ReadService } from './read.service';

export interface ColeccionItem {
  id?: string | number;
}

@Injectable()
export class ControladorService<T extends ColeccionItem> {

  private readonly writeService = inject(WriteService);
  private readonly readService = inject(ReadService);
  public readonly states = signal<StatesEnum>(StatesEnum.DEFAULT);

  // Variables
  protected readonly _coleccion: WritableSignal<T[]> = signal<T[]>([]);
  public readonly coleccion: Signal<T[]> = this._coleccion.asReadonly();
  public readonly totalItems = computed( () => this._coleccion().length );

  
  // Métodos
  agregarItem(item: T): void { this._coleccion.update(coleccion => [...coleccion, item]); }
  eliminarItem(id: string | number): void { this._coleccion.update(coleccion => coleccion.filter(i => i.id !== id)); }
  limpiarColeccion(): void { this._coleccion.set([]); }
  buscarItemPorId(id: string | number): T | undefined { return this._coleccion().find(item => item.id === id); }

 
  async guardarColeccion(nombreColeccion: string, idDocumento: string): Promise<void> {    this.states.set(StatesEnum.LOADING);
    try {      const datos = { items: this._coleccion() };      await this.writeService.crearDocumento(nombreColeccion, idDocumento, datos);      this.states.set(StatesEnum.SUCCESS);    } 
    catch (error) {      this.states.set(StatesEnum.ERROR);    }  }
  
  async cargarColeccion(nombreColeccion: string, idDocumento: string): Promise<void> {    this.states.set(StatesEnum.LOADING);
    try {      const documento = await this.readService.leerDocumento(nombreColeccion, idDocumento);      if (documento && documento['items']) {        this._coleccion.set(documento['items']);      }      this.states.set(StatesEnum.SUCCESS);    } 
    catch (error) {      this.states.set(StatesEnum.ERROR);    }  }}
