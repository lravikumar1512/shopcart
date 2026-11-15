"use client";

import React, { useState, useEffect } from "react";
import { Users, Loader2, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((d) => setUsers(d.users || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-xs text-gray-500">
          View registered customer accounts, total spend, order volumes and roles
        </p>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#2874f0]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Total Spent</th>
                  <th className="p-3">Joined On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const totalSpent = (u.orders || []).reduce(
                    (sum: number, o: any) => sum + (o.totalAmount || 0),
                    0
                  );

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2874f0] font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{u.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-gray-800">
                          {u._count?.orders || 0} orders
                        </span>
                      </td>

                      <td className="p-3 font-bold text-gray-900">
                        {formatCurrency(totalSpent)}
                      </td>

                      <td className="p-3 text-gray-500">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
