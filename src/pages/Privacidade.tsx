import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacidade() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '0 0 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>Política de Privacidade</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Última atualização: abril de 2026</p>

        {[
          {
            title: '1. Informações que Coletamos',
            text: 'Coletamos as seguintes informações ao criar sua conta e usar o Dramix: nome completo, endereço de e-mail, número de WhatsApp (opcional), histórico de visualização e progresso nos vídeos, dados de pagamento (processados pela Asaas — não armazenamos dados de cartão), e informações de uso da plataforma.',
          },
          {
            title: '2. Como Usamos suas Informações',
            text: 'Usamos suas informações para: criar e gerenciar sua conta, processar pagamentos e ativar assinaturas, personalizar sua experiência (continuar assistindo, histórico), enviar comunicações sobre sua conta e atualizações do serviço, e melhorar a plataforma com base no comportamento de uso.',
          },
          {
            title: '3. Compartilhamento de Dados',
            text: 'Não vendemos seus dados pessoais a terceiros. Compartilhamos informações apenas com: processadores de pagamento (Asaas) para fins de cobrança, e provedores de infraestrutura (Cloudflare) para hospedagem segura do serviço. Todos operam com políticas de privacidade próprias.',
          },
          {
            title: '4. Armazenamento e Segurança',
            text: 'Seus dados são armazenados de forma segura na infraestrutura da Cloudflare. Utilizamos criptografia para senhas (bcrypt) e tokens de autenticação. O acesso à base de dados é restrito à equipe técnica do Dramix.',
          },
          {
            title: '5. Seus Direitos (LGPD)',
            text: 'De acordo com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), você tem direito a: acessar seus dados pessoais, corrigir dados incompletos ou desatualizados, solicitar a exclusão dos seus dados, revogar o consentimento para uso dos dados, e obter portabilidade dos seus dados. Para exercer esses direitos, entre em contato pelo e-mail dramixsuporte@gmail.com.',
          },
          {
            title: '6. Cookies e Armazenamento Local',
            text: 'Utilizamos localStorage no navegador para manter sua sessão ativa e salvar preferências locais (como tempo de visualização em modo anônimo). Não utilizamos cookies de rastreamento ou publicidade de terceiros.',
          },
          {
            title: '7. Menores de Idade',
            text: 'O Dramix não é destinado a menores de 13 anos. Não coletamos intencionalmente dados de crianças. Se identificarmos uma conta criada por menor de 13 anos, ela será removida. Para menores entre 13 e 18 anos, é necessária autorização de um responsável legal.',
          },
          {
            title: '8. Retenção de Dados',
            text: 'Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento da conta, seus dados são anonimizados ou excluídos em até 30 dias, exceto quando a retenção for exigida por lei.',
          },
          {
            title: '9. Alterações nesta Política',
            text: 'Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos por e-mail ou aviso na plataforma em caso de mudanças significativas. Recomendamos revisar esta página regularmente.',
          },
          {
            title: '10. Contato',
            text: 'Para exercer seus direitos, tirar dúvidas sobre privacidade ou solicitar exclusão de dados, entre em contato: e-mail dramixsuporte@gmail.com ou pelo WhatsApp disponível na plataforma.',
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
