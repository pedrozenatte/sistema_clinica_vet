// Seed - Dados de exemplo para desenvolvimento

const { sequelize, Cliente, Pet, Veterinario, Servico, Agendamento } = require('./database/index');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar veterinários
    const vets = await Veterinario.bulkCreate([
      {
        nome: 'Dra. Ana Silva',
        crmv: 'CRMV-SP-12345',
        email: 'ana@clinica.com',
        telefone: '(19) 3333-1111',
        especialidade: 'Clínica Geral',
        ativo: true,
      },
      {
        nome: 'Dr. Bruno Costa',
        crmv: 'CRMV-SP-12346',
        email: 'bruno@clinica.com',
        telefone: '(19) 3333-2222',
        especialidade: 'Cirurgia',
        ativo: true,
      },
      {
        nome: 'Dra. Camila Lima',
        crmv: 'CRMV-SP-12347',
        email: 'camila@clinica.com',
        telefone: '(19) 3333-3333',
        especialidade: 'Dermatologia',
        ativo: true,
      },
      {
        nome: 'Dra. Estefany Ferreira',
        crmv: 'CRMV-SP-12348',
        email: 'estefany@clinica.com',
        telefone: '(19) 3333-4444',
        especialidade: 'Oftalmologia',
        ativo: true,
      },
    ], { ignoreDuplicates: true });

    console.log('✓ Veterinários criados');

    // Criar serviços
    const servicos = await Servico.bulkCreate([
      {
        nome: 'Consulta',
        descricao: 'Consulta clínica geral',
        duracao_minutos: 30,
        valor: 150.00,
        ativo: true,
      },
      {
        nome: 'Vacinação',
        descricao: 'Aplicação de vacinas',
        duracao_minutos: 20,
        valor: 80.00,
        ativo: true,
      },
      {
        nome: 'Retorno',
        descricao: 'Retorno para acompanhamento',
        duracao_minutos: 20,
        valor: 100.00,
        ativo: true,
      },
      {
        nome: 'Exames',
        descricao: 'Realização de exames',
        duracao_minutos: 45,
        valor: 250.00,
        ativo: true,
      },
      {
        nome: 'Banho/Tosa',
        descricao: 'Banho e tosa do pet',
        duracao_minutos: 60,
        valor: 120.00,
        ativo: true,
      },
      {
        nome: 'Cirurgia',
        descricao: 'Procedimento cirúrgico',
        duracao_minutos: 120,
        valor: 800.00,
        ativo: true,
      },
    ], { ignoreDuplicates: true });

    console.log('✓ Serviços criados');

    // Criar clientes
    const clientes = await Cliente.bulkCreate([
      {
        codigo: '00136',
        tipo_pessoa: 'Física',
        nome: 'João da Silva',
        email: 'joao@email.com',
        telefone: '(19) 1234-5678',
        sexo: 'M',
        cpf_cnpj: '635.843.340-71',
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cep: '13800-000',
        cidade: 'Mogi Mirim',
        estado: 'SP',
        situacao: 'Liberado',
      },
      {
        codigo: '00158',
        tipo_pessoa: 'Jurídica',
        nome: 'Clínica Amiga Ltda.',
        email: 'contato@amiga.com.br',
        telefone: '(19) 3333-2222',
        cpf_cnpj: '12.345.678/0001-90',
        rua: 'Av. Principal',
        numero: '456',
        bairro: 'Comercial',
        cep: '13090-100',
        cidade: 'Campinas',
        estado: 'SP',
        situacao: 'Liberado',
      },
      {
        codigo: '00174',
        tipo_pessoa: 'Física',
        nome: 'Mariana Souza',
        email: 'mariana@email.com',
        telefone: '(19) 98888-7777',
        sexo: 'F',
        cpf_cnpj: '401.235.654-00',
        rua: 'Rua do Comércio',
        numero: '789',
        bairro: 'Vila Nova',
        cep: '13800-970',
        cidade: 'Jaguariúna',
        estado: 'SP',
        situacao: 'Liberado',
      },
      {
        codigo: '00201',
        tipo_pessoa: 'Física',
        nome: 'Paulo Henrique',
        email: 'paulo.h@email.com',
        telefone: '(19) 9999-0000',
        sexo: 'M',
        cpf_cnpj: '302.543.121-50',
        rua: 'Av. Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cep: '13066-000',
        cidade: 'Campinas',
        estado: 'SP',
        situacao: 'Liberado',
      },
      {
        codigo: '00212',
        tipo_pessoa: 'Física',
        nome: 'Carla Teixeira',
        email: 'carla.t@email.com',
        telefone: '(19) 9999-8888',
        sexo: 'F',
        cpf_cnpj: '721.432.651-89',
        rua: 'Rua da Paz',
        numero: '321',
        bairro: 'Jardins',
        cep: '13073-010',
        cidade: 'Campinas',
        estado: 'SP',
        situacao: 'Liberado',
      },
      {
        codigo: '00223',
        tipo_pessoa: 'Física',
        nome: 'Guilherme Rodrigues',
        email: 'guilherme.r@email.com',
        telefone: '(16) 3333-2222',
        sexo: 'M',
        cpf_cnpj: '543.210.987-65',
        rua: 'Rua das Acácias',
        numero: '555',
        bairro: 'Bosque',
        cep: '13200-000',
        cidade: 'Araçoaba da Serra',
        estado: 'SP',
        situacao: 'Liberado',
      },
    ], { ignoreDuplicates: true });

    console.log('✓ Clientes criados');

    // Criar pets
    const pets = await Pet.bulkCreate([
      {
        cliente_id: clientes[0].id,
        nome: 'Luna',
        especie: 'Canina',
        raca: 'SRD',
        sexo: 'F',
        peso: 15.5,
        cor: 'Branca com manchas pretas',
      },
      {
        cliente_id: clientes[1].id,
        nome: 'Miau',
        especie: 'Felina',
        raca: 'Persa',
        sexo: 'M',
        peso: 4.2,
        cor: 'Cinzenta',
      },
      {
        cliente_id: clientes[2].id,
        nome: 'Thor',
        especie: 'Felina',
        raca: 'Siamês',
        sexo: 'M',
        peso: 3.8,
        cor: 'Bege e marrom',
      },
      {
        cliente_id: clientes[3].id,
        nome: 'Rex',
        especie: 'Canina',
        raca: 'Labrador',
        sexo: 'M',
        peso: 32.0,
        cor: 'Amarela',
      },
      {
        cliente_id: clientes[4].id,
        nome: 'Nina',
        especie: 'Canina',
        raca: 'Poodle',
        sexo: 'F',
        peso: 5.5,
        cor: 'Branca',
      },
      {
        cliente_id: clientes[5].id,
        nome: 'Zeus',
        especie: 'Aves',
        raca: 'Arara',
        sexo: 'M',
        peso: 1.2,
        cor: 'Verde e vermelha',
      },
    ], { ignoreDuplicates: true });

    console.log('✓ Pets criados');

    // Criar agendamentos exemplo
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    await Agendamento.bulkCreate([
      {
        cliente_id: clientes[0].id,
        pet_id: pets[0].id,
        veterinario_id: vets[0].id,
        servico_id: servicos[1].id,
        data_agendamento: amanha,
        hora_inicio: '09:00',
        hora_fim: '09:20',
        status: 'Agendado',
        observacoes: 'Primeira dose da vacina',
      },
      {
        cliente_id: clientes[3].id,
        pet_id: pets[3].id,
        veterinario_id: vets[1].id,
        servico_id: servicos[0].id,
        data_agendamento: amanha,
        hora_inicio: '10:00',
        hora_fim: '10:30',
        status: 'Confirmado',
        observacoes: 'Acompanhamento pós-cirurgia',
      },
      {
        cliente_id: clientes[4].id,
        pet_id: pets[4].id,
        veterinario_id: vets[2].id,
        servico_id: servicos[2].id,
        data_agendamento: amanha,
        hora_inicio: '11:00',
        hora_fim: '11:20',
        status: 'Confirmado',
        observacoes: 'Retorno para verificação',
      },
    ], { ignoreDuplicates: true });

    console.log('✓ Agendamentos criados');
    console.log('✅ Seed concluído com sucesso!');
    console.log('\n📊 Dados de exemplo carregados:');
    console.log(`   - ${vets.length} veterinários`);
    console.log(`   - ${servicos.length} serviços`);
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${pets.length} pets`);

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar seed
seedDatabase();
