import React, { useEffect, useState, useMemo } from "react";
import { Users } from "./constants";
import Header from "./Header";
import Skeleton from "./Skeleton";
import formatTimestamp from "../Utils/commonUtils";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import moment from "moment";

const OrganisationHome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsersMap, setSelectedUsersMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [leftSearch, setLeftSearch] = useState("");
  const [originalUsers, setOriginalUsers] = useState([]);

  // filters
  const [search, setSearch] = useState("");

  /**
   * LOAD USERS
   */
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || Users;

    setUsers(storedUsers);
    setOriginalUsers(storedUsers); // ✅ keep original

    const map = {};
    storedUsers.forEach((user) => {
      if (user.teammates?.length) {
        map[user.id] = user.teammates;
      }
    });

    setSelectedUsersMap(map);
    setLoading(false);
  }, []);

  const handleLeftSearch = (value) => {
    setLeftSearch(value);

    if (!value.trim()) {
      setUsers(originalUsers); // ✅ restore full list
      return;
    }

    const filtered = originalUsers.filter((u) =>
      u.name.toLowerCase().includes(value.toLowerCase())
    );

    setUsers(filtered);
  };

  /**
   * SELECT USER
   */
  const handleUserSelect = (id) => {
    setSelectedUserId(id);

    setSelectedUsersMap((prev) => ({
      ...prev,
      [id]: prev[id] || [],
    }));
  };

  /**
   * TOGGLE TEAMMATE
   */
  const toggleUserSelection = (user) => {
    if (!selectedUserId) return;
    if (user.id === selectedUserId) return;

    const list = selectedUsersMap[selectedUserId] || [];

    const exists = list.some((u) => u.id === user.id);

    const updated = exists
      ? list.filter((u) => u.id !== user.id)
      : [...list, user];

    setSelectedUsersMap((prev) => ({
      ...prev,
      [selectedUserId]: updated,
    }));
  };

  /**
   * SAVE
   */
  const handleSubmit = () => {
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUserId) {
        return {
          ...user,
          teammates: selectedUsersMap[selectedUserId] || [],
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    alert("Saved successfully");
  };

  /**
   * SELECTED USER
   */
  const selectedUser = users.find((u) => u.id === selectedUserId);

  /**
   * DATA PREP
   */
  const tableData = useMemo(() => {
    if (!selectedUser) return [];

    let data = [];

    // own reviews (self review)
    selectedUser.reviews?.forEach((r) => {
      data.push({
        name: selectedUser.name,
        reviewBy: r.reviewBy,
        designation: r?.designation,
        rating: r.rating,
        chips: r.chips,
        date: r.date,
        comment: r.comment,
      });
    });

    // teammates reviews
    selectedUser.teammates?.forEach((tm) => {
      tm.reviews?.forEach((r) => {
        data.push({
          name: tm.name,
          reviewBy: r.reviewBy,
          designation: r?.designation,
          rating: r.rating,
          chips: r.chips,
          date: r.date,
          comment: r.comment,
        });
      });
    });

    // 🔍 filter (handle object chips)
    return data.filter((row) => {
      const allChips = [
        ...(row.chips?.positive || []),
        ...(row.chips?.negative || []),
      ];

      return (
        (row.reviewBy === selectedUser?.name ||
          row.name === selectedUser?.name) &&
        (row.name.toLowerCase().includes(search.toLowerCase()) ||
          allChips.join(", ").toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [selectedUser, search]);

  /**
   * COLUMNS
   */
  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Review By",
        accessorKey: "reviewBy",
        cell: ({ getValue }) => (
          <span className="font-medium text-blue-600">{getValue()}</span>
        ),
      },
      {
        header: "Designation",
        accessorKey: "designation",
        cell: ({ getValue }) => (
          <span className="font-medium text-blue-600">{getValue()}</span>
        ),
      },
      {
        header: "Rating",
        accessorKey: "rating",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <div className="text-yellow-400">
              {"★".repeat(val)}
              <span className="text-gray-300">{"★".repeat(5 - val)}</span>
            </div>
          );
        },
      },
      {
        header: "Chips",
        accessorKey: "chips",
        cell: ({ getValue }) => {
          const chips = getValue();

          const allChips = [
            ...(chips?.positive || []),
            ...(chips?.negative || []),
          ];

          return (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {allChips.map((chip, i) => {
                const isPositive = chips?.positive?.includes(chip);

                return (
                  <span
                    key={i}
                    className={`px-2 py-1 text-xs rounded-full ${
                      isPositive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {chip}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        header: "Comments",
        accessorKey: "comment",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className="font-medium text-blue-600 whitespace-pre-wrap break-words">
              {value || "-"}
            </span>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => formatTimestamp(getValue()),
      },
    ],
    []
  );

  /**
   * TABLE
   */
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="h-[100vh] p-4 bg-gray-100">
      <Header />

      <div className="flex gap-5">
        {/* LEFT */}
        <div className="w-1/5 bg-white p-4 rounded-xl shadow h-[calc(100vh-150px)] flex flex-col">
          {/* 🔍 SEARCH */}
          <div className="mb-3">
            <input
              value={leftSearch}
              onChange={(e) => handleLeftSearch(e.target.value)}
              placeholder="Search teammates..."
              className="w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <Skeleton />
            ) : users.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedUserId === user.id
                      ? "bg-blue-100 border-blue-300 shadow-sm"
                      : "bg-white hover:bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />

                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.designation}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-lg h-[calc(100vh-150px)] w-4/5 flex flex-col">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              Please assign teammates
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Assign Teammates for {selectedUser.name}
                  </h2>
                </div>

                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-600"
                >
                  Save
                </button>
              </div>

              {/* SELECTED TEAMMATES */}
              <div className="flex h-[25vh] gap-6 mb-2">
                <div className="w-1/2 h-fit">
                  <div className="flex items-center gap-4 justify-between mb-2">
                    <div className="text-lg font-semibold">
                      Selected Teammates for {selectedUser.name}
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-600"
                    >
                      {/* Icon */}
                      <span className="text-lg leading-none">+</span>

                      {/* Text */}
                      <span>Add Teammates</span>

                      {/* Count Badge */}
                      {selectedUsersMap[selectedUserId]?.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                          {selectedUsersMap[selectedUserId].length}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="h-[19vh] overflow-auto p-4 border rounded-2xl">
                    {(selectedUsersMap[selectedUserId] || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(selectedUsersMap[selectedUserId] || []).map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-full"
                          >
                            <img
                              alt=""
                              src={u.avatar}
                              className="w-6 h-6 rounded-full flex-shrink-0"
                            />

                            <span className="text-sm max-w-[120px] truncate">
                              {u.name}
                            </span>

                            <button
                              onClick={() => toggleUserSelection(u)}
                              className="ml-1 text-xs flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="text-4xl mb-2">👥</div>
                        <div className="italic">No teammates assigned</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-1/2 h-fit">
                  <div className="text-lg font-semibold py-2">
                    Suggestions from {selectedUser.name}
                  </div>
                  <div className="space-y-4 h-[19vh] overflow-auto p-4 border rounded-2xl">
                    {selectedUser?.suggestions?.length > 0 ? (
                      selectedUser.suggestions.map((val) => (
                        <div
                          key={val.id}
                          className="p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-xs text-gray-400">
                              {moment(val.date).format("DD MMM YYYY • HH:mm")}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {val.suggestion}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <div className="text-4xl mb-2">💡</div>
                        <div className="italic">No suggestions available</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SEARCH */}
              <div className="mb-4">
                <input
                  placeholder="Search reviews..."
                  className="w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* TABLE */}
              <div className="flex-1 overflow-auto border rounded-xl">
                {tableData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                    No reviews available
                  </div>
                ) : (
                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                          {hg.headers.map((h) => (
                            <th
                              key={h.id}
                              onClick={h.column.getToggleSortingHandler()}
                              className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
                            >
                              {flexRender(
                                h.column.columnDef.header,
                                h.getContext()
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>

                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t hover:bg-gray-50 transition group"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="p-3">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => table.previousPage()}
                  className="px-4 py-1.5 rounded-lg border hover:bg-gray-100"
                >
                  Prev
                </button>

                <span className="text-sm text-gray-500">
                  Page {table.getState().pagination.pageIndex + 1}
                </span>

                <button
                  onClick={() => table.nextPage()}
                  className="px-4 py-1.5 rounded-lg border hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] h-[50vh] rounded-2xl p-5 flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Teammates</h2>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* SEARCH */}
            <input
              placeholder="Search users..."
              className="w-full p-2 mb-4 border rounded-lg"
              onChange={(e) => setModalSearch(e.target.value)}
            />

            {/* LIST (FLEX VERSION) */}
            <div className="flex-1 overflow-auto flex flex-col gap-3">
              {(() => {
                const filteredUsers = users
                  .filter((u) => u.id !== selectedUserId)
                  .filter((u) =>
                    u.name.toLowerCase().includes(modalSearch.toLowerCase())
                  );

                if (filteredUsers.length === 0) {
                  return (
                    <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="text-3xl mb-2">🔍</div>
                      <div className="text-sm">No matches found</div>
                    </div>
                  );
                }

                return filteredUsers.map((u) => {
                  const selected = selectedUsersMap[selectedUserId]?.some(
                    (x) => x.id === u.id
                  );

                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUserSelection(u)}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer border ${
                        selected
                          ? "bg-green-100 border-green-400"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          alt=""
                          src={u.avatar}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">
                            {u.designation}
                          </div>
                        </div>
                      </div>

                      {selected && (
                        <span className="text-green-600 font-semibold">✓</span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* FOOTER */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-blue-500 text-white py-2 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganisationHome;
