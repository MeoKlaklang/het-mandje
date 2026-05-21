"use client";

import { useEffect, useMemo, useState } from "react";
import DierenartsLayout from "@/components/dierenarts/DierenartsLayout";
import {
  getDierenartsTasks,
  DierenartsTask,
  DierenartsTaskStatus,
} from "@/lib/dierenarts/getDierenartsTasks";
import { createDierenartsTask } from "@/lib/dierenarts/createDierenartsTask";
import { updateDierenartsTaskStatus } from "@/lib/dierenarts/updateDierenartsTaskStatus";
import {
  getDierenartsAnimalsForSelect,
  DierenartsAnimalOption,
} from "@/lib/dierenarts/getDierenartsAnimalsForSelect";
import {
  getDierenartsDashboardData,
  DierenartsCalendarAppointment,
} from "@/lib/dierenarts/getDierenartsDashboardData";
import {
  getDierenartsTodos,
  DierenartsTodo,
} from "@/lib/dierenarts/getDierenartsTodos";
import { createDierenartsTodo } from "@/lib/dierenarts/createDierenartsTodo";
import { toggleDierenartsTodo } from "@/lib/dierenarts/toggleDierenartsTodo";
import styles from "./taken.module.css";

type Column = {
  id: DierenartsTaskStatus;
  title: string;
  description: string;
};

const columns: Column[] = [
  {
    id: "in_progress",
    title: "In progress",
    description: "Taken die nog uitgevoerd moeten worden.",
  },
  {
    id: "in_review",
    title: "In review",
    description: "Taken die nagekeken of opgevolgd worden.",
  },
  {
    id: "done",
    title: "Done",
    description: "Taken die afgerond zijn.",
  },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function startOfWeek(date: Date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  newDate.setDate(newDate.getDate() + diff);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
}

function addDays(date: Date, amount: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + amount);
  return newDate;
}

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function getCalendarDays(currentMonth: Date) {
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const start = startOfWeek(firstDay);

  return Array.from({ length: 35 }, (_, index) => addDays(start, index));
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("nl-BE", {
    month: "long",
    year: "numeric",
  });
}

export default function DierenartsTakenPage() {
  const [tasks, setTasks] = useState<DierenartsTask[]>([]);
  const [animals, setAnimals] = useState<DierenartsAnimalOption[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<
    DierenartsCalendarAppointment[]
  >([]);
  const [todos, setTodos] = useState<DierenartsTodo[]>([]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [savingTodo, setSavingTodo] = useState(false);
  const [todoLoading, setTodoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [todoModalOpen, setTodoModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdByName, setCreatedByName] = useState("");

  const [animalSearch, setAnimalSearch] = useState("");
  const [selectedAnimal, setSelectedAnimal] =
    useState<DierenartsAnimalOption | null>(null);

  const [todoTitle, setTodoTitle] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  const [todoDueDate, setTodoDueDate] = useState(todayDate());

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] =
    useState<DierenartsTaskStatus | null>(null);

  async function loadPageData() {
    setLoading(true);

    const [tasksResult, animalsResult, dashboardResult, todoResult] =
      await Promise.all([
        getDierenartsTasks(),
        getDierenartsAnimalsForSelect(),
        getDierenartsDashboardData(),
        getDierenartsTodos(),
      ]);

    if (tasksResult.error) {
      setErrorMessage(tasksResult.error);
    } else if (animalsResult.error) {
      setErrorMessage(animalsResult.error);
    } else if (dashboardResult.error) {
      setErrorMessage(dashboardResult.error);
    } else if (todoResult.error) {
      setErrorMessage(todoResult.error);
    } else {
      setErrorMessage("");
    }

    setTasks(tasksResult.tasks);
    setAnimals(animalsResult.animals);
    setCalendarAppointments(dashboardResult.calendarAppointments || []);
    setTodos(todoResult.todos);
    setLoading(false);
  }

  async function reloadTodos() {
    setTodoLoading(true);

    const result = await getDierenartsTodos();

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setTodos(result.todos);
    }

    setTodoLoading(false);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredAnimals = useMemo(() => {
    const query = animalSearch.trim().toLowerCase();

    if (!query) return animals.slice(0, 5);

    return animals
      .filter((animal) => {
        const name = animal.name.toLowerCase();
        const species = animal.species.toLowerCase();
        const breed = animal.breed?.toLowerCase() || "";

        return (
          name.includes(query) ||
          species.includes(query) ||
          breed.includes(query)
        );
      })
      .slice(0, 5);
  }, [animalSearch, animals]);

  const tasksByStatus = useMemo(() => {
    return columns.reduce<Record<DierenartsTaskStatus, DierenartsTask[]>>(
      (acc, column) => {
        acc[column.id] = tasks.filter((task) => task.status === column.id);
        return acc;
      },
      {
        in_progress: [],
        in_review: [],
        done: [],
      }
    );
  }, [tasks]);

  const calendarDays = useMemo(() => {
    return getCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCreatedByName("");
    setAnimalSearch("");
    setSelectedAnimal(null);
  };

  const resetTodoForm = () => {
    setTodoTitle("");
    setTodoDescription("");
    setTodoDueDate(todayDate());
  };

  const previousMonth = () => {
    setCalendarMonth(
      (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCalendarMonth(
      (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)
    );
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert("Vul een titel in voor de taak.");
      return;
    }

    setSavingTask(true);

    const result = await createDierenartsTask({
      title,
      description,
      animalId: selectedAnimal?.id,
      createdByName,
    });

    setSavingTask(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    resetForm();
    setModalOpen(false);

    await loadPageData();
  };

  const handleDrop = async (status: DierenartsTaskStatus) => {
    if (!draggedTaskId) return;

    const currentTask = tasks.find((task) => task.id === draggedTaskId);

    if (!currentTask || currentTask.status === status) {
      setDraggedTaskId(null);
      setDragOverColumn(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === draggedTaskId ? { ...task, status } : task
      )
    );

    const result = await updateDierenartsTaskStatus(draggedTaskId, status);

    if (!result.success) {
      alert(result.error);
      await loadPageData();
    }

    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleCreateTodo = async () => {
    if (!todoTitle.trim()) {
      alert("Vul een titel in voor je todo.");
      return;
    }

    setSavingTodo(true);

    const result = await createDierenartsTodo({
      title: todoTitle,
      description: todoDescription,
      dueDate: todoDueDate,
    });

    setSavingTodo(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    resetTodoForm();
    setTodoModalOpen(false);

    await reloadTodos();
  };

  const handleToggleTodo = async (todo: DierenartsTodo) => {
    const result = await toggleDierenartsTodo(todo.id, !todo.is_done);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setTodos((currentTodos) =>
      currentTodos
        .map((item) =>
          item.id === todo.id ? { ...item, is_done: !item.is_done } : item
        )
        .sort((a, b) => Number(a.is_done) - Number(b.is_done))
    );
  };

  return (
    <DierenartsLayout>
      <main className={styles.page}>
        <section className={styles.header}>
          <div>
            <p>Takenbord</p>
            <h1>Tasks</h1>
            <span>
              Beheer medische opvolgingen, controles en interne taken per dier.
            </span>
          </div>

          <button
            type="button"
            className={styles.createButton}
            onClick={() => setModalOpen(true)}
          >
            + Maak taak
          </button>
        </section>

        {loading ? (
          <section className={styles.messageCard}>
            <h2>Taken worden geladen...</h2>
            <p>We halen je taken, agenda en todo’s op.</p>
          </section>
        ) : errorMessage ? (
          <section className={styles.messageCard}>
            <h2>Er ging iets mis</h2>
            <p>{errorMessage}</p>
          </section>
        ) : (
          <section className={styles.tasksLayout}>
            <div className={styles.boardPanel}>
              <section className={styles.board}>
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className={`${styles.column} ${
                      dragOverColumn === column.id
                        ? styles.columnDragOver
                        : ""
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverColumn(column.id);
                    }}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={() => handleDrop(column.id)}
                  >
                    <div className={styles.columnHeader}>
                      <div>
                        <h2>{column.title}</h2>
                        <p>{column.description}</p>
                      </div>

                      <span>{tasksByStatus[column.id].length}</span>
                    </div>

                    <div className={styles.taskList}>
                      {tasksByStatus[column.id].length === 0 ? (
                        <div className={styles.emptyColumn}>
                          Geen taken in deze kolom.
                        </div>
                      ) : (
                        tasksByStatus[column.id].map((task) => (
                          <article
                            key={task.id}
                            className={styles.taskCard}
                            draggable
                            onDragStart={() => setDraggedTaskId(task.id)}
                            onDragEnd={() => {
                              setDraggedTaskId(null);
                              setDragOverColumn(null);
                            }}
                          >
                            <div className={styles.taskTop}>
                              <span>{formatDate(task.created_at)}</span>
                              <strong>⋮</strong>
                            </div>

                            <h3>{task.title}</h3>

                            {task.description && <p>{task.description}</p>}

                            {task.animal && (
                              <div className={styles.animalBox}>
                                <img
                                  src={
                                    task.animal.image_url || "/images/dog3.jpg"
                                  }
                                  alt={task.animal.name}
                                />

                                <div>
                                  <strong>{task.animal.name}</strong>
                                  <span>
                                    {task.animal.breed ||
                                      task.animal.species ||
                                      "Dier"}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className={styles.taskFooter}>
                              <span>
                                {task.created_by_name || "Dierenartsenteam"}
                              </span>
                              <small>Sleep om status te wijzigen</small>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </section>
            </div>

            <aside className={styles.sidePanel}>
              <section className={styles.miniCalendar}>
                <div className={styles.calendarTop}>
                  <button type="button" onClick={previousMonth}>
                    ‹
                  </button>

                  <h2>{formatMonth(calendarMonth)}</h2>

                  <button type="button" onClick={nextMonth}>
                    ›
                  </button>
                </div>

                <div className={styles.calendarDaysHeader}>
                  <span>Ma</span>
                  <span>Di</span>
                  <span>Wo</span>
                  <span>Do</span>
                  <span>Vr</span>
                  <span>Za</span>
                  <span>Zo</span>
                </div>

                <div className={styles.calendarGrid}>
                  {calendarDays.map((day) => {
                    const hasAppointment = calendarAppointments.some(
                      (appointment) =>
                        sameDay(new Date(appointment.start_at), day)
                    );

                    const isCurrentMonth =
                      day.getMonth() === calendarMonth.getMonth();

                    return (
                      <button
                        type="button"
                        key={day.toISOString()}
                        className={`${styles.calendarDay} ${
                          sameDay(day, new Date()) ? styles.todayDay : ""
                        } ${!isCurrentMonth ? styles.otherMonth : ""}`}
                      >
                        {day.getDate()}
                        {hasAppointment && <span></span>}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.todoCard}>
                <div className={styles.sideHeader}>
                  <h2>To do’s vandaag</h2>

                  <button
                    type="button"
                    onClick={() => setTodoModalOpen(true)}
                  >
                    + Toevoegen
                  </button>
                </div>

                {todoLoading ? (
                  <div className={styles.emptyTodo}>
                    Todo’s worden geladen...
                  </div>
                ) : todos.length === 0 ? (
                  <div className={styles.emptyTodo}>
                    Geen todo’s voor vandaag.
                  </div>
                ) : (
                  <div className={styles.todoList}>
                    {todos.map((todo) => (
                      <label
                        key={todo.id}
                        className={`${styles.todoItem} ${
                          todo.is_done ? styles.todoDone : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={todo.is_done}
                          onChange={() => handleToggleTodo(todo)}
                        />

                        <span>
                          {todo.title}
                          {todo.description && <small>{todo.description}</small>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </section>
        )}

        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe taak</p>
                <h2>Maak taak aan</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijv. Bloedresultaten nakijken"
                />
              </label>

              <label>
                Dier koppelen
                <input
                  type="text"
                  value={animalSearch}
                  onChange={(e) => {
                    setAnimalSearch(e.target.value);
                    setSelectedAnimal(null);
                  }}
                  placeholder="Zoek op naam, ras of soort..."
                />
              </label>

              {selectedAnimal ? (
                <div className={styles.selectedAnimal}>
                  <img
                    src={selectedAnimal.image_url || "/images/dog3.jpg"}
                    alt={selectedAnimal.name}
                  />

                  <div>
                    <h3>{selectedAnimal.name}</h3>
                    <p>
                      {selectedAnimal.breed || selectedAnimal.species} ·{" "}
                      {selectedAnimal.status || "status onbekend"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnimal(null);
                      setAnimalSearch("");
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={styles.animalResults}>
                  {filteredAnimals.length === 0 ? (
                    <p>Geen dieren gevonden.</p>
                  ) : (
                    filteredAnimals.map((animal) => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => {
                          setSelectedAnimal(animal);
                          setAnimalSearch(animal.name);
                        }}
                      >
                        <img
                          src={animal.image_url || "/images/dog3.jpg"}
                          alt={animal.name}
                        />

                        <span>
                          <strong>{animal.name}</strong>
                          {animal.breed || animal.species}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <label>
                Aangemaakt door
                <input
                  type="text"
                  value={createdByName}
                  onChange={(e) => setCreatedByName(e.target.value)}
                  placeholder="Bijv. Dr. Kingen"
                />
              </label>

              <label>
                Beschrijving
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschrijf wat er moet gebeuren..."
                />
              </label>

              <div className={styles.infoNotice}>
                Nieuwe taken starten automatisch in de kolom “In progress”. Je
                kan ze daarna verslepen naar “In review” of “Done”.
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={savingTask}
                  onClick={handleCreateTask}
                >
                  {savingTask ? "Opslaan..." : "Taak opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {todoModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => {
                  resetTodoForm();
                  setTodoModalOpen(false);
                }}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe todo</p>
                <h2>Todo toevoegen</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  placeholder="Bijv. Dossier Demon aanvullen"
                />
              </label>

              <label>
                Datum
                <input
                  type="date"
                  value={todoDueDate}
                  onChange={(e) => setTodoDueDate(e.target.value)}
                />
              </label>

              <label>
                Beschrijving
                <textarea
                  value={todoDescription}
                  onChange={(e) => setTodoDescription(e.target.value)}
                  placeholder="Extra info over deze todo..."
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    resetTodoForm();
                    setTodoModalOpen(false);
                  }}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={savingTodo}
                  onClick={handleCreateTodo}
                >
                  {savingTodo ? "Opslaan..." : "Todo opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DierenartsLayout>
  );
}