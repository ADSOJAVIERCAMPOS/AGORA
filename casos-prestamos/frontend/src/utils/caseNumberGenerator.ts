import pool from '@/config/database';

export interface CaseNumberConfig {
  prefix: string;
  year: number;
  maxAttempts?: number;
}

export class CaseNumberGenerator {
  private static async checkCaseNumberExists(numeroCaso: string, tableName: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM ${tableName} WHERE numero_caso = $1`,
        [numeroCaso]
      );
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  private static async checkPrestamoNumberExists(numeroCaso: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM prestamos WHERE numero_caso = $1`,
        [numeroCaso]
      );
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  private static generateRandomNumber(): string {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }

  static async generateCaseNumber(config: CaseNumberConfig, tableName: string): Promise<string> {
    const maxAttempts = config.maxAttempts || 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const randomNum = this.generateRandomNumber();
      const numeroCaso = `${config.prefix}-${config.year}-${randomNum}`;

      const exists = await this.checkCaseNumberExists(numeroCaso, tableName);
      
      if (!exists) {
        return numeroCaso;
      }

      attempts++;
    }

    throw new Error(`No se pudo generar un número de caso único después de ${maxAttempts} intentos`);
  }

  static async generatePrestamoNumber(config: CaseNumberConfig): Promise<string> {
    const maxAttempts = config.maxAttempts || 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const randomNum = this.generateRandomNumber();
      const numeroCaso = `${config.prefix}-${config.year}-${randomNum}`;

      const exists = await this.checkPrestamoNumberExists(numeroCaso);
      
      if (!exists) {
        return numeroCaso;
      }

      attempts++;
    }

    throw new Error(`No se pudo generar un número de préstamo único después de ${maxAttempts} intentos`);
  }

  // Métodos específicos para cada tipo de caso
  static async generateGeneralCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    return this.generateCaseNumber(
      { prefix: 'CG', year },
      'casos_generales'
    );
  }

  static async generateSpecialCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    return this.generateCaseNumber(
      { prefix: 'CE', year },
      'casos_especiales'
    );
  }

  static async generateAcudienteCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    return this.generateCaseNumber(
      { prefix: 'CA', year },
      'casos_acudientes'
    );
  }

  static async generatePrestamoCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    return this.generatePrestamoNumber(
      { prefix: 'PR', year }
    );
  }
} 