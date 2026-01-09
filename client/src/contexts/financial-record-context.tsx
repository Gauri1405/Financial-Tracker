import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

export interface FinancialRecord {
  _id?: string;
  userId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
}

interface FinancialRecordsContextType {
  records: FinancialRecord[];
  addRecord: (record: FinancialRecord) => Promise<void>;
  updateRecord: (id: string, newRecord: FinancialRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const FinancialRecordsContext = createContext<
  FinancialRecordsContextType | undefined
>(undefined);

export const FinancialRecordsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const { user } = useUser();

  // 🔹 Fetch all records of logged-in user
  const fetchRecords = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/financial-records/getAllByUserID/${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch records");
      }

      const records = await response.json();
      setRecords(records);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  // 🔹 Add record
  const addRecord = async (record: FinancialRecord) => {
    try {
      const response = await fetch(`${API_BASE_URL}/financial-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error("Failed to add record");
      }

      const newRecord = await response.json();
      setRecords((prev) => [...prev, newRecord]);
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  // 🔹 Update record
  const updateRecord = async (id: string, newRecord: FinancialRecord) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/financial-records/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRecord),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update record");
      }

      const updatedRecord = await response.json();
      setRecords((prev) =>
        prev.map((record) =>
          record._id === id ? updatedRecord : record
        )
      );
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  // 🔹 Delete record
  const deleteRecord = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/financial-records/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      const deletedRecord = await response.json();
      setRecords((prev) =>
        prev.filter((record) => record._id !== deletedRecord._id)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <FinancialRecordsContext.Provider
      value={{ records, addRecord, updateRecord, deleteRecord }}
    >
      {children}
    </FinancialRecordsContext.Provider>
  );
};

export const useFinancialRecords = () => {
  const context = useContext(FinancialRecordsContext);

  if (!context) {
    throw new Error(
      "useFinancialRecords must be used within a FinancialRecordsProvider"
    );
  }

  return context;
};
