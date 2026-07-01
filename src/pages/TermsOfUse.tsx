import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const terms = [
  {
    title: '1. Aceitação dos termos',
    paragraphs: [
      'Ao utilizar o aplicativo PetMatch, o usuário declara que leu, compreendeu e concorda com os presentes Termos de Uso e Ciência.',
      'Caso não concorde com qualquer condição aqui descrita, o usuário não deve utilizar a plataforma.',
    ],
  },
  {
    title: '2. Objetivo da plataforma',
    paragraphs: [
      'O PetMatch é uma plataforma digital destinada a aproximar tutores de animais de estimação, possibilitando a criação de perfis de pets e interação entre usuários para fins sociais, como encontros, amizades e socialização animal.',
      'O PetMatch não é responsável por encontros presenciais entre usuários, sendo tais decisões de inteira responsabilidade dos envolvidos.',
    ],
  },
  {
    title: '3. Cadastro e veracidade das informações',
    paragraphs: [
      'O usuário declara ser o único responsável pelas informações fornecidas no cadastro, incluindo fotos, dados pessoais e dados do pet.',
      'O PetMatch não garante a veracidade, autenticidade ou precisão dos perfis criados pelos usuários, podendo existir perfis falsos, incompletos ou enganosos.',
    ],
  },
  {
    title: '4. Responsabilidade do usuário',
    paragraphs: [
      'O usuário concorda que:',
      'É responsável por suas interações dentro e fora da plataforma;',
      'Deve tomar precauções ao interagir com outros usuários;',
      'Assume total responsabilidade por encontros presenciais realizados com terceiros;',
      'Não poderá imputar ao PetMatch qualquer responsabilidade por danos, prejuízos, perdas ou incidentes decorrentes de interações entre usuários.',
    ],
  },
  {
    title: '5. Perfis falsos e segurança',
    paragraphs: [
      'O PetMatch adota medidas razoáveis para prevenção de fraudes e perfis falsos, porém:',
      'Não garante a inexistência de perfis falsos ou fraudulentos;',
      'Não se responsabiliza por condutas enganosas de usuários;',
      'Recomenda que o usuário não compartilhe dados pessoais sensíveis com terceiros.',
    ],
  },
  {
    title: '6. Conteúdo gerado por usuários',
    paragraphs: [
      'Todo conteúdo publicado pelos usuários (fotos, textos, descrições, mensagens) é de responsabilidade exclusiva do próprio usuário.',
      'O PetMatch não se responsabiliza por conteúdos ofensivos, ilegais ou inadequados publicados por terceiros, podendo, entretanto, removê-los a seu critério.',
    ],
  },
  {
    title: '7. Limitação de responsabilidade',
    paragraphs: [
      'O PetMatch não será responsável por:',
      'Danos físicos, materiais ou morais decorrentes de interações entre usuários;',
      'Encontros presenciais entre tutores ou pets;',
      'Perfis falsos ou informações inverídicas;',
      'Uso indevido da plataforma por terceiros;',
      'Eventos fora do controle razoável da plataforma.',
    ],
  },
  {
    title: '8. Segurança e recomendações',
    paragraphs: [
      'Recomenda-se que os usuários:',
      'Realizem encontros apenas em locais públicos e seguros;',
      'Não compartilhem endereço, documentos ou dados bancários;',
      'Denunciem perfis suspeitos dentro do aplicativo;',
      'Utilizem cautela em qualquer interação com terceiros.',
    ],
  },
  {
    title: '9. Moderação e suspensão',
    paragraphs: [
      'O PetMatch pode suspender ou excluir contas que violem estes termos ou apresentem comportamento suspeito, sem necessidade de aviso prévio.',
    ],
  },
  {
    title: '10. Alterações dos termos',
    paragraphs: [
      'O PetMatch pode alterar estes Termos de Uso a qualquer momento, sendo responsabilidade do usuário consultá-los periodicamente.',
    ],
  },
  {
    title: '11. Ciência do risco',
    paragraphs: [
      'O usuário declara estar ciente de que:',
      'A plataforma apenas facilita conexões entre usuários;',
      'Não há garantia de segurança, veracidade ou comportamento dos demais usuários;',
      'Toda interação entre usuários ocorre por conta e risco próprios.',
    ],
  },
  {
    title: '12. Foro',
    paragraphs: [
      'Fica eleito o foro da comarca do domicílio do responsável pelo aplicativo, para dirimir quaisquer controvérsias decorrentes destes termos.',
    ],
  },
];

const TermsOfUse: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-4 px-0">
        <Link to="/register">
          <ArrowLeft className="h-4 w-4" />
          Voltar para cadastro
        </Link>
      </Button>

      <div className="mb-6">
        <p className="page-kicker">Termos</p>
        <h1 className="page-title mt-2">Termos de Uso e Ciência - PetMatch</h1>
      </div>

      <Card className="soft-panel">
        <CardContent className="space-y-7 p-6 sm:p-8">
          {terms.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-gray-950">{section.title}</h2>
              <div className="mt-3 space-y-2 text-sm leading-7 text-gray-700 sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfUse;
