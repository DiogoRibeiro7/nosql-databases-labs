#!/usr/bin/env bash
# Importa patients, visits e lab_results para a base medical_database.
# Pré-requisitos: MongoDB a correr, mongoimport. Uso: ./import_data.sh (a partir da raiz do repo ou desta pasta).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/data"
URI="${MONGODB_URI:-mongodb://localhost:27017}"

if [ ! -f "${DATA_DIR}/patients.json" ] || [ ! -f "${DATA_DIR}/visits.json" ] || [ ! -f "${DATA_DIR}/lab_results.json" ]; then
  echo "Erro: ficheiros não encontrados em ${DATA_DIR}. São necessários patients.json, visits.json, lab_results.json."
  exit 1
fi

echo "A importar para medical_database..."
mongoimport --uri="${URI}" --db=medical_database --collection=patients --file="${DATA_DIR}/patients.json" --jsonArray
mongoimport --uri="${URI}" --db=medical_database --collection=visits --file="${DATA_DIR}/visits.json" --jsonArray
mongoimport --uri="${URI}" --db=medical_database --collection=lab_results --file="${DATA_DIR}/lab_results.json" --jsonArray
echo "Import concluído: patients, visits, lab_results."
