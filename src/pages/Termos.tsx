import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Termos() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '0 0 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>Termos de Uso</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Última atualização: abril de 2026</p>

        {[
          {
            title: '1. Aceitação dos Termos',
            text: 'Ao acessar ou usar o Dramix ("Serviço"), você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço. O uso continuado após alterações nestes termos implica aceitação das mudanças.',
          },
          {
            title: '2. Descrição do Serviço',
            text: 'O Dramix é uma plataforma de streaming de mini doramas e séries curtas em português. O conteúdo disponível pode variar conforme o plano contratado. Reservamo-nos o direito de adicionar, remover ou alterar conteúdos a qualquer momento.',
          },
          {
            title: '3. Conta e Acesso',
            text: 'Você deve criar uma conta para acessar o conteúdo. É responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente em caso de uso não autorizado. Cada conta é pessoal e intransferível.',
          },
          {
            title: '4. Planos e Pagamento',
            text: 'O Dramix oferece planos pagos (Básico R$12,90/mês e Premium R$24,90/mês) e um período de teste gratuito. Os pagamentos são processados via PIX através da plataforma Asaas. O acesso é liberado após confirmação do pagamento. Não há reembolso após a ativação do plano mensal.',
          },
          {
            title: '5. Cancelamento',
            text: 'Você pode cancelar sua assinatura a qualquer momento pelo menu de configurações. O acesso permanece ativo até o fim do período já pago. Após o vencimento sem renovação, o acesso é automaticamente rebaixado para gratuito.',
          },
          {
            title: '6. Uso Permitido',
            text: 'O conteúdo do Dramix é licenciado para uso pessoal e não comercial. É proibido: compartilhar credenciais de acesso, reproduzir, distribuir ou transmitir o conteúdo para terceiros, usar ferramentas de download ou captura de vídeo, e qualquer uso que infrinja direitos autorais.',
          },
          {
            title: '7. Propriedade Intelectual',
            text: 'Todo o conteúdo disponível na plataforma (vídeos, imagens, textos, logos) é protegido por leis de direitos autorais. O Dramix não reivindica propriedade sobre conteúdos de terceiros licenciados, mas detém os direitos sobre a plataforma, marca e identidade visual.',
          },
          {
            title: '8. Limitação de Responsabilidade',
            text: 'O Dramix não se responsabiliza por interrupções no serviço, erros técnicos, perda de dados ou danos decorrentes do uso da plataforma. O serviço é fornecido "como está", sem garantias expressas ou implícitas de disponibilidade ininterrupta.',
          },
          {
            title: '9. Modificações',
            text: 'Podemos alterar estes Termos a qualquer momento. Notificaremos usuários sobre mudanças relevantes por e-mail ou aviso na plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.',
          },
          {
            title: '10. Contato',
            text: 'Para dúvidas, sugestões ou suporte, entre em contato pelo e-mail dramixsuporte@gmail.com ou pelo WhatsApp disponível na plataforma.',
          },
        ].map(({ title, text }) => (
          <div key={title} className="mb-6">
            <h2 className="font-bold mb-2" style={{ color: 'var(--text)', fontSize: 15 }}>{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
