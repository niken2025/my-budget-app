import { supabase } from "./supabase";
import { Transaction } from "./types";

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, category, description, date")
    .order("date", { ascending: false });

  if (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));
}

export async function addTransaction(
  transaction: Transaction
): Promise<Transaction[]> {
  const { error } = await supabase.from("transactions").insert({
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
  });

  if (error) {
    console.error("Failed to add transaction:", error);
  }

  return getTransactions();
}

export async function deleteTransaction(id: string): Promise<Transaction[]> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete transaction:", error);
  }

  return getTransactions();
}

export async function importTransactions(
  newItems: Transaction[]
): Promise<Transaction[]> {
  const rows = newItems.map((item) => ({
    id: item.id,
    type: item.type,
    amount: item.amount,
    category: item.category,
    description: item.description,
    date: item.date,
  }));

  const { error } = await supabase.from("transactions").insert(rows);

  if (error) {
    console.error("Failed to import transactions:", error);
  }

  return getTransactions();
}
