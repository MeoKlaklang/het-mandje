"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const columns: { id: DierenartsTaskStatus; title: string }[] = [
  { id: "in_progress", title: "In progress" },
  { id: "in_review", title: "Review" },
  { id: "done", title: "Done" },
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

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
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
  const [appointments, setAppointments] = useState<
    DierenartsCalendarAppointment[]
  >([]);
  const [todos, setTodos] = useState<DierenartsTodo[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [todoSaving, setTodoSaving] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [newTodo, setNewTodo] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdByName, setCreatedByName] = useState("");

  const [animalSearch, setAnimalSearch] = useState("");
  const [selectedAnimal, setSelectedAnimal] =
    useState<DierenartsAnimalOption | null>(null);

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

    setTasks(tasksResult.tasks || []);
    setAnimals(animalsResult.animals || []);
    setAppointments(dashboardResult.calendarAppointments || []);
    setTodos(todoResult.todos || []);
    setLoading(false);
  }

  async function reloadTodos() {
    const result = await getDierenartsTodos();

    if (result.error) {
      alert(result.error);
      return;
    }

    setTodos(result.todos || []);
  }

  useEffect(() => {
    loadPageData();
  }, []);

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

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [todos]);

  const previousMonth = () => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  };

  const resetTaskForm = () => {
    setTitle("");
    setDescription("");
    setCreatedByName("");
    setAnimalSearch("");
    setSelectedAnimal(null);
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

    resetTaskForm();
    setTaskModalOpen(false);
    await loadPageData();
  };

  const handleMoveTask = async (
    taskId: string,
    nextStatus: DierenartsTaskStatus
  ) => {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === nextStatus) {
      setDraggedTaskId(null);
      setDragOverColumn(null);
      return;
    }

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );

    const result = await updateDierenartsTaskStatus(taskId, nextStatus);

    if (!result.success) {
      setTasks(previousTasks);
      alert(result.error);
    }

    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleCreateTodo = async () => {
    if (!newTodo.trim()) {
      alert("Schrijf eerst een todo.");
      return;
    }

    setTodoSaving(true);

    const result = await createDierenartsTodo({
      title: newTodo,
      description: "",
      dueDate: todayDate(),
    });

    setTodoSaving(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setNewTodo("");
    await reloadTodos();
  };

  const handleToggleTodo = async (todo: DierenartsTodo) => {
    const nextValue = !todo.is_done;

    setUpdatingTodoId(todo.id);

    const result = await toggleDierenartsTodo(todo.id, nextValue);

    setUpdatingTodoId(null);

    if (!result.success) {
      alert(result.error);
      return;
    }

    await reloadTodos();
  };

  return (
    <DierenartsLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <section className={styles.header}>
            <div>
              <h1>Task</h1>
              <p>
                Beheer medische opvolgingen, controles en interne taken binnen
                je dierenartspraktijk.
              </p>
            </div>

            <button
              type="button"
              className={styles.createButton}
              onClick={() => setTaskModalOpen(true)}
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
            <section className={styles.layoutGrid}>
              <div className={styles.board}>
                {columns.map((column) => {
                  const columnTasks = tasksByStatus[column.id];

                  return (
                    <section
                      key={column.id}
                      className={`${styles.column} ${
                        dragOverColumn === column.id ? styles.columnOver : ""
                      }`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverColumn(column.id);
                      }}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={() => {
                        if (draggedTaskId) {
                          handleMoveTask(draggedTaskId, column.id);
                        }
                      }}
                    >
                      <div className={styles.columnHeader}>
                        <h2>{column.title}</h2>
                        <span>{columnTasks.length}</span>
                      </div>

                      <div className={styles.taskList}>
                        {columnTasks.length === 0 ? (
                          <div className={styles.emptyColumn}>
                            Sleep hier een taak naartoe.
                          </div>
                        ) : (
                          columnTasks.map((task) => (
                            <article
                              key={task.id}
                              className={`${styles.taskCard} ${
                                draggedTaskId === task.id
                                  ? styles.taskDragging
                                  : ""
                              }`}
                              draggable
                              onDragStart={() => setDraggedTaskId(task.id)}
                              onDragEnd={() => {
                                setDraggedTaskId(null);
                                setDragOverColumn(null);
                              }}
                            >
                              <button
                                type="button"
                                className={styles.dragHandle}
                                aria-label="Taak verslepen"
                              >
                                ⋮⋮
                              </button>

                              <div className={styles.taskTop}>
                                <span className={styles.priorityDot}></span>
                                <p>{formatDate(task.created_at)}</p>
                              </div>

                              <h3>{task.title}</h3>

                              {task.animal && (
                                <Link
                                  href={`/dierenarts/dieren/${task.animal.id}/dossier`}
                                  className={styles.linkedAnimal}
                                >
                                  <img
                                    src={
                                      task.animal.image_url ||
                                      "/images/dog3.jpg"
                                    }
                                    alt={task.animal.name}
                                  />

                                  <span>{task.animal.name}</span>
                                </Link>
                              )}

                              {task.description && (
                                <p className={styles.description}>
                                  {task.description}
                                </p>
                              )}

                              <div className={styles.taskMeta}>
                                <span>
                                  {task.created_by_name || "Dierenartsenteam"}
                                </span>
                              </div>

                              <div className={styles.moveButtons}>
                                {task.status !== "in_progress" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveTask(task.id, "in_progress")
                                    }
                                  >
                                    In progress
                                  </button>
                                )}

                                {task.status !== "in_review" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveTask(task.id, "in_review")
                                    }
                                  >
                                    Review
                                  </button>
                                )}

                                {task.status !== "done" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveTask(task.id, "done")
                                    }
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              <aside className={styles.sidePanel}>
                <article className={styles.sideCard}>
                  <div className={styles.sideHeader}>
                    <Link href="/dierenarts/agenda">
                      Bekijk volledige agenda
                    </Link>
                  </div>

                  <div className={styles.miniCalendar}>
                    <div className={styles.calendarTop}>
                      <button type="button" onClick={previousMonth}>
                        ‹
                      </button>

                      <h3>{formatMonth(calendarMonth)}</h3>

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
                        const hasAppointment = appointments.some(
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
                  </div>
                </article>

                <article className={styles.sideCard}>
                  <div className={styles.sideHeader}>
                    <h2>To do’s vandaag</h2>
                  </div>

                  <div className={styles.todoInput}>
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(event) => setNewTodo(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleCreateTodo();
                        }
                      }}
                      placeholder="Nieuwe todo..."
                    />

                    <button
                      type="button"
                      disabled={todoSaving}
                      onClick={handleCreateTodo}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.todoDashboardList}>
                    {sortedTodos.length === 0 ? (
                      <p className={styles.emptyTodo}>
                        Geen todo’s voor vandaag.
                      </p>
                    ) : (
                      sortedTodos.map((todo) => (
                        <label
                          key={todo.id}
                          className={`${styles.dashboardTodoItem} ${
                            todo.is_done ? styles.taskDone : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={todo.is_done}
                            disabled={updatingTodoId === todo.id}
                            onChange={() => handleToggleTodo(todo)}
                          />

                          <span>{todo.title}</span>
                        </label>
                      ))
                    )}
                  </div>

                  <p className={styles.todoHint}>
                    Afgevinkte todo’s verdwijnen automatisch de volgende dag.
                  </p>
                </article>
              </aside>
            </section>
          )}
        </div>

        {taskModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => {
                  resetTaskForm();
                  setTaskModalOpen(false);
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
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Bijv. Bloedresultaten nakijken"
                />
              </label>

              <label>
                Dier koppelen
                <input
                  type="text"
                  value={animalSearch}
                  onChange={(event) => {
                    setAnimalSearch(event.target.value);
                    setSelectedAnimal(null);
                  }}
                  placeholder="Zoek op naam, ras of soort..."
                />
              </label>

              {selectedAnimal ? (
                <div className={styles.selectedAnimalBox}>
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
                  onChange={(event) => setCreatedByName(event.target.value)}
                  placeholder="Bijv. Dr. Kingen"
                />
              </label>

              <label>
                Beschrijving
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Beschrijf kort wat er moet gebeuren..."
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    resetTaskForm();
                    setTaskModalOpen(false);
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
      </main>
    </DierenartsLayout>
  );
}