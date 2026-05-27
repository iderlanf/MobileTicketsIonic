import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab3Page implements OnInit {
  tipoRelatorio: 'diario' | 'mensal' = 'diario';
  dados: any = null;

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.buscarDados();
  }

  ionViewWillEnter() {
    this.buscarDados();
  }

  mudarRelatorio() {
    this.buscarDados();
  }

  buscarDados() {
    if (this.tipoRelatorio === 'diario') {
      this.ticketService.getRelatorioDiario().subscribe({
        next: (res) => {
          this.dados = res;
        },
        error: (err) => {
          console.error('Erro ao buscar relatório diário:', err);
        }
      });
    } else {
      this.ticketService.getRelatorioMensal().subscribe({
        next: (res) => {
          this.dados = res;
        },
        error: (err) => {
          console.error('Erro ao buscar relatório mensal:', err);
        }
      });
    }
  }
}