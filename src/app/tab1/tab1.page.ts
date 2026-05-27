import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab1Page {
  constructor(
    private ticketService: TicketService, 
    private alertCtrl: AlertController
  ) {}

  emitir(tipo: 'SP' | 'SG' | 'SE') {
    this.ticketService.gerarSenha(tipo).subscribe({
      next: async (res) => {
        const alert = await this.alertCtrl.create({
          header: 'Senha Gerada com Sucesso!',
          message: `Sua senha é: ${res.codigo_senha}`,
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Não foi possível gerar a senha. Verifique a conexão com o servidor.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}