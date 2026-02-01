# Arquitetura da Solução – Healthcare Patient Records System

## 1. Justificação do Uso de MongoDB

A escolha do MongoDB para o desenvolvimento deste sistema de registos clínicos justifica-se pelas suas características orientadas a dados semi-estruturados, elevada flexibilidade e capacidade de escalabilidade, fundamentais em ambientes de saúde.

- **Esquema flexível (schema-less)**  
  Permite acomodar diferentes tipos de encontros clínicos, exames laboratoriais e estruturas de dados que evoluem ao longo do tempo, sem necessidade de migrações complexas.

- **Documentos ricos e hierárquicos**  
  Suporta a embebição de subdocumentos como observações, diagnósticos, contactos e parâmetros laboratoriais, reduzindo a dependência de *joins* e melhorando o desempenho.

- **Escalabilidade horizontal**  
  A arquitetura distribuída do MongoDB permite lidar eficientemente com grandes volumes de dados clínicos, comuns em sistemas hospitalares de média e grande dimensão.

- **Aggregation Framework**  
  Possibilita a criação de queries analíticas avançadas para relatórios clínicos, estatísticas e dashboards.

- **Alta disponibilidade e segurança**  
  O MongoDB Atlas fornece replicação automática, encriptação de dados e controlo de acessos, essenciais para dados sensíveis na área da saúde.

---

## 2. Modelo de Dados

O sistema é composto por cinco coleções principais, cada uma representando um domínio funcional específico do sistema clínico.

### 2.1. Coleções Principais

1. **Patients** – Armazena dados demográficos, contactos e identificadores únicos do paciente.  
2. **ClinicalEncounters** – Representa episódios clínicos como consultas, urgências ou internamentos.  
3. **LabResults** – Contém resultados laboratoriais estruturados.  
4. **Providers** – Regista profissionais de saúde e instituições.  
5. **AuditLogs** – Mantém registos de auditoria e rastreabilidade.

---

## 3. Decisões de Modelação: Embebição vs Referenciação

### Embebição
Utilizada quando os dados pertencem exclusivamente ao documento principal, são frequentemente acedidos em conjunto e têm cardinalidade reduzida.

### Referenciação
Utilizada quando os dados são partilhados entre entidades, têm elevada cardinalidade ou exigem consistência lógica.

---

## 4. Exemplos de Documentos

### Patients
```json
{
  "patientId": "P0001",
  "name": { "first": "Ana", "last": "Silva" },
  "birthDate": "1985-03-10",
  "gender": "F",
  "contacts": {
    "phone": "+351900000000",
    "email": "ana.silva@example.com"
  }
}
```

### ClinicalEncounters
```json
{
  "encounterId": "E1001",
  "patientId": "P0001",
  "type": "consulta",
  "date": "2024-01-15T10:00:00Z"
}
```

---

## 5. Relações Entre Coleções

- Patients (1) — (N) ClinicalEncounters  
- Patients (1) — (N) LabResults  
- Providers (1) — (N) ClinicalEncounters  

---

## 6. Estratégias de Indexação

- Patients: `{ patientId: 1 }`
- ClinicalEncounters: `{ patientId: 1, date: -1 }`
- LabResults: `{ patientId: 1, collectedAt: -1 }`

---

## 7. Segurança e Privacidade

- Encriptação em trânsito e em repouso  
- Controlo de acessos baseado em funções (RBAC)  
- Auditoria completa de acessos

---

## 8. Escalabilidade

- Sharding por `patientId`
- Evolução do esquema sem migrações disruptivas

---

## 9. Conclusão

A arquitetura proposta garante flexibilidade, desempenho, segurança e escalabilidade, sendo adequada para sistemas modernos de registos clínicos.
