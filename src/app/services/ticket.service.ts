import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Chamado {
  id?: number;
  codigo_senha: string;
  tipo: 'SP' | 'SG' | 'SE';
  sequencia: number;
  data_emissao: Date;
  data_atendimento?: Date;
  guiche?: number;
  status: 'AGUARDANDO' | 'ATENDIDO';
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  gerarSenha(tipo: 'SP' | 'SG' | 'SE'): Observable<Chamado> {
    return this.http.post<Chamado>(`${this.apiUrl}/gerar`, { tipo });
  }

  chamarProxima(guiche: number, ordemAtual: string): Observable<Chamado> {
    return this.http.post<Chamado>(`${this.apiUrl}/chamar`, { guiche, ordemAtual });
  }

  getUltimasChamadas(): Observable<Chamado[]> {
    return this.http.get<Chamado[]>(`${this.apiUrl}/ultimas`);
  }

  getRelatorioDiario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/relatorio/diario`);
  }

  getRelatorioMensal(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/relatorio/mensal`);
  }
}