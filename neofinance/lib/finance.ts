/**
 * Financial Analysis Library
 * 
 * This module provides functions for analyzing transaction data and generating
 * financial insights. It includes utilities for summarizing spending by category,
 * calculating trends, and preparing data for AI analysis.
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Transaction interface defining the structure of financial transactions
 */
export interface Transaction {
  date: string;      // YYYY-MM-DD format
  category: string;  // Transaction category
  amount: number;    // Transaction amount (positive for expenses, negative for income)
}

/**
 * Monthly summary interface for categorized spending
 */
export interface MonthlySummary {
  [category: string]: number;  // Category name to total amount mapping
}

/**
 * Reads transaction data from the JSON file
 * @returns Promise<Transaction[]> Array of transactions
 */
export async function getTransactions(): Promise<Transaction[]> {
  const dataPath = path.join(process.cwd(), 'data', 'transactions.json');
  const data = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Generates a monthly summary of transactions by category
 * @param transactions Array of transactions to analyze
 * @returns MonthlySummary Object containing category totals
 */
export function getMonthlySummary(transactions: Transaction[]): MonthlySummary {
  // Initialize summary object
  const summary: MonthlySummary = {};

  // Process each transaction
  transactions.forEach(transaction => {
    const { category, amount } = transaction;
    
    // Add amount to category total
    // If category doesn't exist, initialize it
    summary[category] = (summary[category] || 0) + amount;
  });

  return summary;
}

/**
 * Calculates spending trends over time
 * @param transactions Array of transactions to analyze
 * @returns Object containing trend data
 */
export function calculateTrends(transactions: Transaction[]) {
  // Group transactions by month
  const monthlyData: { [month: string]: MonthlySummary } = {};
  
  transactions.forEach(transaction => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = {};
    }
    
    const { category, amount } = transaction;
    monthlyData[month][category] = (monthlyData[month][category] || 0) + amount;
  });

  return monthlyData;
}

/**
 * Identifies significant changes in spending patterns
 * @param transactions Array of transactions to analyze
 * @returns Object containing change analysis
 */
export function analyzeChanges(transactions: Transaction[]) {
  const monthlyData = calculateTrends(transactions);
  const months = Object.keys(monthlyData).sort();
  
  if (months.length < 2) {
    return { message: 'Insufficient data for trend analysis' };
  }

  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];
  
  const changes: { [category: string]: number } = {};
  
  // Calculate percentage changes for each category
  Object.keys(monthlyData[currentMonth]).forEach(category => {
    const current = monthlyData[currentMonth][category];
    const previous = monthlyData[previousMonth][category] || 0;
    
    if (previous !== 0) {
      changes[category] = ((current - previous) / Math.abs(previous)) * 100;
    }
  });

  return {
    currentMonth,
    previousMonth,
    changes
  };
}
