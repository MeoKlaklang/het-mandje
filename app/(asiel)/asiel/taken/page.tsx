"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import AsielLayout from "@/components/asiel/AsielLayout";
import {
  getShelterTasks,
  ShelterTask,
  ShelterTaskStatus,
} from "@/lib/asiel/getShelterTasks";
import { createShelterTask } from "@/lib/asiel/createShelterTask";
import { updateShelterTaskStatus } from "@/lib/asiel/updateShelterTaskStatus";
import {
  getShelterAnimalsForSelect,
  ShelterAnimalOption,
} from "@/lib/asiel/getShelterAnimalsForSelect";
import {
  getShelterTodos,
  ShelterTodo,
} from "@/lib/asiel/getShelterTodos";
import { createShelterTodo } from "@/lib/asiel/createShelterTodo";
import { toggleShelterTodo } from "@/lib/asiel/toggleShelterTodo";
import {
  getShelterAgendaData,
  ShelterAgendaAppointment,
} from "@/lib/asiel/getShelterAgendaData";
import styles from "./taken.module.css";

const columns: { id: ShelterTaskStatus; title: string }[] = [
  { id: "in_progress", title: "In progress" },
  { id: "in_review", title: "Review" },
  { id: "done", title: "Done" },
];

function isTaskStatus(value: string): value is ShelterTaskStatus {
  return value === "in_progress" || value === "in_review" || value === "done";
}

function formatPriority(priority: string | null) {
  if (priority === "high") return "Belangrijk";
  if (priority === "low") return "Laag";
  return "Normaal";
}

function getPriorityClass(priority: string | null) {
  if (priority === "high") return styles.high;
  if (priority === "low") return styles.low;
  return "";
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

function DroppableColumn({
  id,
  children,
}: {
  id: ShelterTaskStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ""}`}
    >
      {children}
    </section>
  );
}

function DraggableTaskCard({
  task,
  onMoveTask,
  updatingTaskId,
}: {
  task: ShelterTask;
  onMoveTask: (taskId: string, nextStatus: ShelterTaskStatus) => void;
  updatingTaskId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        task,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`${styles.taskCard} ${isDragging ? styles.taskDragging : ""}`}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label="Taak verslepen"
        {...listeners}
        {...attributes}
      >
        ⋮⋮
      </button>

      <div className={styles.taskTop}>
        <span
          className={`${styles.priorityDot} ${getPriorityClass(task.priority)}`}
        ></span>
        <p>{formatPriority(task.priority)}</p>
      </div>

      <h3>{task.title}</h3>

      {task.animals && (
        <Link
          href={`/asiel/dieren/${task.animals.id}/bewerken`}
          className={styles.linkedAnimal}
        >
          <img
            src={task.animals.image_url || "/images/dog3.jpg"}
            alt={task.animals.name}
          />

          <span>{task.animals.name}</span>
        </Link>
      )}

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.taskMeta}>
        {task.created_by ? (
          <span>Aangemaakt door {task.created_by}</span>
        ) : (
          <span>Asielteam</span>
        )}
      </div>

      <div className={styles.moveButtons}>
        {task.status !== "in_progress" && (
          <button
            type="button"
            disabled={updatingTaskId === task.id}
            onClick={() => onMoveTask(task.id, "in_progress")}
          >
            In progress
          </button>
        )}

        {task.status !== "in_review" && (
          <button
            type="button"
            disabled={updatingTaskId === task.id}
            onClick={() => onMoveTask(task.id, "in_review")}
          >
            Review
          </button>
        )}

        {task.status !== "done" && (
          <button
            type="button"
            disabled={updatingTaskId === task.id}
            onClick={() => onMoveTask(task.id, "done")}
          >
            Done
          </button>
        )}
      </div>
    </article>
  );
}

function TaskPreview({ task }: { task: ShelterTask }) {
  return (
    <article className={`${styles.taskCard} ${styles.taskPreview}`}>
      <div className={styles.taskTop}>
        <span
          className={`${styles.priorityDot} ${getPriorityClass(task.priority)}`}
        ></span>
        <p>{formatPriority(task.priority)}</p>
      </div>

      <h3>{task.title}</h3>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
    </article>
  );
}

export default function TakenPage() {
  const [tasks, setTasks] = useState<ShelterTask[]>([]);
  const [todos, setTodos] = useState<ShelterTodo[]>([]);
  const [animals, setAnimals] = useState<ShelterAnimalOption[]>([]);
  const [appointments, setAppointments] = useState<
    ShelterAgendaAppointment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const [savingTask, setSavingTask] = useState(false);
  const [todoSaving, setTodoSaving] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<ShelterTask | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [newTodo, setNewTodo] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [priority, setPriority] = useState("normal");

  const [animalSearch, setAnimalSearch] = useState("");
  const [selectedAnimal, setSelectedAnimal] =
    useState<ShelterAnimalOption | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function loadPageData() {
    setLoading(true);

    const [tasksResult, animalsResult, todosResult, agendaResult] =
      await Promise.all([
        getShelterTasks(),
        getShelterAnimalsForSelect(),
        getShelterTodos(),
        getShelterAgendaData(),
      ]);

    if (tasksResult.error) {
      setErrorMessage(tasksResult.error);
    } else if (animalsResult.error) {
      setErrorMessage(animalsResult.error);
    } else if (todosResult.error) {
      setErrorMessage(todosResult.error);
    } else if (agendaResult.error) {
      setErrorMessage(agendaResult.error);
    } else {
      setErrorMessage("");
    }

    setTasks(tasksResult.tasks || []);
    setAnimals(animalsResult.animals || []);
    setTodos(todosResult.todos || []);
    setAppointments(agendaResult.appointments || []);

    setLoading(false);
  }

  async function reloadTodos() {
    const result = await getShelterTodos();

    if (result.error) {
      alert(result.error);
      return;
    }

    setTodos(result.todos || []);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  const calendarDays = useMemo(() => {
    return getCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const filteredAnimals = useMemo(() => {
    const query = animalSearch.trim().toLowerCase();

    if (!query) return animals.slice(0, 5);

    return animals
      .filter((animal) => {
        const name = animal.name.toLowerCase();
        const breed = animal.breed?.toLowerCase() || "";
        const species = animal.species.toLowerCase();

        return (
          name.includes(query) ||
          breed.includes(query) ||
          species.includes(query)
        );
      })
      .slice(0, 5);
  }, [animalSearch, animals]);

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.is_done !== b.is_done) {
        return a.is_done ? 1 : -1;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
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

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert("Geef je taak een titel.");
      return;
    }

    setSavingTask(true);

    const result = await createShelterTask({
      title,
      description,
      createdBy,
      animalId: selectedAnimal?.id || "",
      priority,
      dueDate: "",
    });

    setSavingTask(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setTitle("");
    setDescription("");
    setCreatedBy("");
    setPriority("normal");
    setAnimalSearch("");
    setSelectedAnimal(null);
    setTaskModalOpen(false);

    await loadPageData();
  };

  const handleMoveTask = async (
    taskId: string,
    nextStatus: ShelterTaskStatus
  ) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || task.status === nextStatus) return;

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === taskId ? { ...item, status: nextStatus } : item
      )
    );

    setUpdatingTaskId(taskId);

    const result = await updateShelterTaskStatus({
      taskId,
      status: nextStatus,
    });

    setUpdatingTaskId(null);

    if (!result.success) {
      setTasks(previousTasks);
      alert(result.error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as ShelterTask | undefined;

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const taskId = String(active.id);
    const nextStatus = String(over.id);

    if (!isTaskStatus(nextStatus)) return;

    await handleMoveTask(taskId, nextStatus);
  };

  const handleCreateTodo = async () => {
    if (!newTodo.trim()) {
      alert("Schrijf eerst een todo.");
      return;
    }

    setTodoSaving(true);

    const result = await createShelterTodo({
      description: newTodo,
      createdBy: "Dierenasiel",
    });

    setTodoSaving(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setNewTodo("");
    await reloadTodos();
  };

  const handleToggleTodo = async (todo: ShelterTodo) => {
    const nextValue = !todo.is_done;

    setUpdatingTodoId(todo.id);

    const result = await toggleShelterTodo({
      todoId: todo.id,
      isDone: nextValue,
    });

    setUpdatingTodoId(null);

    if (!result.success) {
      alert(result.error);
      return;
    }

    await reloadTodos();
  };

  return (
    <AsielLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <section className={styles.header}>
            <div>
              <h1>Task</h1>
              <p>
                Beheer opvolgingen, medische taken en dagelijkse acties binnen
                het asiel.
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
              <p>We halen de taken van je dierenasiel op.</p>
            </section>
          ) : errorMessage ? (
            <section className={styles.messageCard}>
              <h2>Er ging iets mis</h2>
              <p>{errorMessage}</p>
            </section>
          ) : (
            <section className={styles.layoutGrid}>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.board}>
                  {columns.map((column) => {
                    const columnTasks = tasks.filter(
                      (task) => task.status === column.id
                    );

                    return (
                      <DroppableColumn key={column.id} id={column.id}>
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
                              <DraggableTaskCard
                                key={task.id}
                                task={task}
                                onMoveTask={handleMoveTask}
                                updatingTaskId={updatingTaskId}
                              />
                            ))
                          )}
                        </div>
                      </DroppableColumn>
                    );
                  })}
                </div>

                <DragOverlay>
                  {activeTask ? <TaskPreview task={activeTask} /> : null}
                </DragOverlay>
              </DndContext>

              <aside className={styles.sidePanel}>
                <article className={styles.sideCard}>
                  <div className={styles.sideHeader}>
                    <Link href="/asiel/agenda">Bekijk volledige agenda</Link>
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

                          <span>{todo.description}</span>
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
                onClick={() => setTaskModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe taak</p>
                <h2>Maak een taak aan</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijv. Medicatie voorschrift klaarzetten"
                />
              </label>

              <label>
                Koppel aan dier
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
                <div className={styles.selectedAnimalBox}>
                  <img
                    src={selectedAnimal.image_url || "/images/dog3.jpg"}
                    alt={selectedAnimal.name}
                  />

                  <div>
                    <h3>{selectedAnimal.name}</h3>
                    <p>
                      {selectedAnimal.breed || selectedAnimal.species} ·{" "}
                      {selectedAnimal.species}
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

              <div className={styles.formGrid}>
                <label>
                  Aangemaakt door
                  <input
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="Bijv. Dr. Kingen"
                  />
                </label>

                <label>
                  Prioriteit
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Laag</option>
                    <option value="normal">Normaal</option>
                    <option value="high">Belangrijk</option>
                  </select>
                </label>
              </div>

              <label>
                Beschrijving
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschrijf kort wat er moet gebeuren..."
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setTaskModalOpen(false)}
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
    </AsielLayout>
  );
}