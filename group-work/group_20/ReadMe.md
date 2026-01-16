# Group 20 – NoSQL Final Project

## Group Information

**Group Number:** 20  
**Project Theme:** Saúde (Projeto 4 – Healthcare Patient Records System)  
**Course:** NoSQL Databases

### Team Members

| Name | Student ID |
|------|------------|
| Diogo Pinheiro | 40220098 |
| Samuel Fernandes | 40220214 |

---

## Executive Summary

Este projeto tem como base a **Sugestão de Projeto 4 – Saúde**, focando-se no desenho e implementação de um **Sistema de Registos Clínicos de Pacientes** utilizando MongoDB. O sistema foi concebido para modelar dados médicos complexos, garantindo segurança, privacidade, auditabilidade e desempenho, de acordo com as boas práticas na área da saúde.

A solução demonstra competências avançadas de modelação NoSQL, utilização de estratégias de indexação, queries de agregação e uma abordagem consciente dos requisitos de conformidade aplicáveis a sistemas de informação clínica.

---

## Problem Statement

Os sistemas de saúde lidam com dados altamente sensíveis e estruturalmente complexos, incluindo informação demográfica de pacientes, consultas clínicas, resultados laboratoriais e registos de auditoria. Modelos relacionais tradicionais apresentam limitações em termos de flexibilidade, escalabilidade e adaptação a esquemas médicos em constante evolução.

O objetivo deste projeto é desenhar uma solução baseada em MongoDB que:
- Armazene dados clínicos e de pacientes de forma eficiente
- Suporte queries médicas e análises complexas
- Garanta controlo de acessos e registo de auditoria
- Escale de forma eficaz com o crescimento do volume de dados

---

## Requirements

- Desenho de um modelo NoSQL flexível para registos clínicos
- Implementação das coleções de pacientes, consultas, exames laboratoriais e auditoria
- Suporte a queries de agregação complexas
- Aplicação de estratégias de indexação para otimização de desempenho
- Consideração de requisitos de segurança e privacidade

---

## Solution Architecture

### Data Model Design

O sistema é composto pelas seguintes coleções principais:

- **Patients** – dados demográficos e histórico médico
- **Clinical Encounters** – consultas, diagnósticos e planos terapêuticos
- **Lab Results** – resultados estruturados de exames laboratoriais
- **Providers** – profissionais de saúde
- **Audit Logs** – histórico completo de acessos e alterações

É utilizada **embebição** para dados fortemente relacionados (por exemplo, alergias do paciente) e **referenciação** para entidades com elevado crescimento ou partilha entre documentos (como consultas e exames).

---

## Implementation

### Setup Instructions

```bash
# Instalar dependências
npm install

# Popular a base de dados com dados sintéticos
node data/seed.js

# Executar queries
node queries.js
