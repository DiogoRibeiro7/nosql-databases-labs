# Group 20 – NoSQL Lab Submission  
## Healthcare Patient Records System

## Group Information

**Group Number:** group_20  
**Submission Date:** 2026-01-06  
**Lab Assignment:** MongoDB Database Operations Lab

### Team Members

| Name   | Student ID | Email | Contribution % |
|--------|------------|-------|----------------|
| Diogo | 40220098 | TBD | 50% |
| Samuel | 40220214 | TBD | 50% |

**Total:** 100%

---

## Executive Summary

Este projeto implementa um sistema de Registos Clínicos de Pacientes utilizando MongoDB.  
O objetivo é modelar, armazenar e consultar dados clínicos reais, incluindo:

- Pacientes  
- Encontros clínicos (consultas, urgências, internamentos)  
- Resultados laboratoriais  
- Profissionais de saúde  
- Registos de auditoria  

Foram desenvolvidos:

- Um modelo de dados NoSQL flexível e escalável  
- Scripts de importação de dados em `.mongosh.js`  
- Conjunto de queries funcionais e analíticas  
- Testes de integridade e validação  
- Documentação completa da arquitetura  

O sistema demonstra boas práticas de modelação NoSQL, embebição, referenciação, indexação e uso do Aggregation Framework.

---

## Problem Statement

O desafio consiste em criar uma base de dados MongoDB para um sistema clínico, garantindo:

- Representação eficiente de dados heterogéneos  
- Suporte a consultas analíticas e operacionais  
- Estrutura flexível para evolução futura  
- Rastreabilidade através de logs de auditoria  

### Requirements

- [x] Definir o domínio de dados e o workload clínico  
- [x] Implementar CRUD e pipelines de agregação  
- [x] Criar índices e garantir performance  
- [x] Implementar testes de integridade  
- [x] Documentar arquitetura e decisões de modelação  

---

## Solution Architecture

A arquitetura completa encontra‑se descrita em `architecture.md`.  
Resumo:

### Data Model Design

O sistema utiliza cinco coleções principais:

- **Patients**
- **ClinicalEncounters**
- **LabResults**
- **Providers**
- **AuditLogs**

### Embedding vs Referencing

- **Embebição**: contactos, endereços, diagnósticos, observações, parâmetros laboratoriais  
- **Referenciação**: relações entre pacientes, encontros, exames e providers  

### Design Decisions

1. **Document modeling**  
   - Estrutura otimizada para leitura de históricos clínicos completos  
   - Dados embebidos para reduzir *joins*  
   - Referenciação para entidades partilhadas (providers, pacientes)

2. **Indexing strategy**  
   - Índices únicos: `patientId`, `encounterId`, `labResultId`, `providerId`  
   - Índices compostos:  
     - `{ patientId: 1, date: -1 }`  
     - `{ patientId: 1, collectedAt: -1 }`  

3. **Validation & governance**  
   - Estrutura consistente entre documentos  
   - Logs de auditoria para rastreabilidade  
   - Segurança garantida pelo MongoDB Atlas (TLS + encriptação)

### Trade-offs Considered

| Approach | Pros | Cons | Decision |
| -------- | ---- | ---- | -------- |
| Embedding | Leitura rápida, menos *joins* | Documentos maiores | Usado em dados dependentes |
| Referencing | Normalização, reutilização | Requer `$lookup` | Usado em entidades partilhadas |

---

## Implementation

### Setup Instructions

1. Clonar o repositório  
2. Aceder à pasta `project/`  
3. Executar scripts de importação:

```bash
mongosh "<connection-string>" project/data/patients.mongosh.js
mongosh "<connection-string>" project/data/clinical_encounters.mongosh.js
mongosh "<connection-string>" project/data/lab_results.mongosh.js
mongosh "<connection-string>" project/data/providers.mongosh.js
mongosh "<connection-string>" project/data/audit_logs.mongosh.js
