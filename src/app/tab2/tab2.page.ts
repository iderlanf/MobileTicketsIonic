import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { TicketService, Chamado } from '../services/ticket.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab2Page implements OnInit {
  guicheSelecionado: number = 1;
  ultimasSenhas: any[] = [];
  
  ordemRotativa: string[] = ['SP', 'SE', 'SG'];
  indexOrdemAtual: number = 0;

  // Cria o objeto de áudio apontando para a pasta
  private somCampainha = new Audio('assets/som/campainha.mp3');

  constructor(
    private ticketService: TicketService, 
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.carregarPainel();
  }

  ionViewWillEnter() {
    this.carregarPainel();
  }

  carregarPainel() {
    this.ticketService.getUltimasChamadas().subscribe({
      next: (res) => {
        this.ultimasSenhas = res;
      },
      error: () => {
        console.error('Erro ao atualizar o painel.');
      }
    });
  }

  chamarProxima() {
    const proximoTipo = this.ordemRotativa[this.indexOrdemAtual];

    this.ticketService.chamarProxima(this.guicheSelecionado, proximoTipo).subscribe({
      next: async (res: any) => {
        if (res && res.codigo_senha) {
          this.indexOrdemAtual = this.ordemRotativa.indexOf(res.proximoTipoSugerido);
          
          // Toca o som da campainha
          this.tocarSom();

          this.carregarPainel();
        } else {
          const toast = await this.toastCtrl.create({
            message: 'Não há mais senhas aguardando atendimento.',
            duration: 3000,
            position: 'bottom',
            color: 'warning'
          });
          await toast.present();
        }
      },
      error: async () => {
        console.error('Erro de conexão com o servidor.');
      }
    });
  }

  tocarSom() {
    this.somCampainha.currentTime = 0;
    this.somCampainha.play().catch(error => {
      console.log('O navegador bloqueou a reprodução automática. Aguarde a interação do usuário.', error);
    });
  }
}