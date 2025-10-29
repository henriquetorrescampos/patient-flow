// src/types/PatientTypes.js (apenas para referência de estrutura)

/** @typedef {'FONO' | 'TO' | 'PSICO' | 'PSICOPEDAGOGIA'} AreaType */

/**
 * @typedef {object} CheckboxData
 * @property {number} id
 * @property {number} patientId
 * @property {AreaType} area
 * @property {number} checkboxNumber
 * @property {boolean} isChecked
 * @property {string | null} checkedDate
 */

/**
 * @typedef {object} PatientData
 * @property {number} id
 * @property {string} name
 * @property {CheckboxData[]} checkboxes
 */

export const areaLabels = {
  FONO: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  PSICO: "Psicologia",
  PSICOPEDAGOGIA: "Psicopedagogia",
};
