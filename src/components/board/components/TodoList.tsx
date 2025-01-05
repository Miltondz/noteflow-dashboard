import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  content: string;
  onChange: (content: string) => void;
}

export function TodoList({ content, onChange }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');
  const todos: TodoItem[] = content ? JSON.parse(content) : [];

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const newTodos = [
      ...todos,
      { id: crypto.randomUUID(), text: newTodo.trim(), completed: false }
    ];
    onChange(JSON.stringify(newTodos));
    setNewTodo('');
  };

  const handleToggleTodo = (id: string) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    onChange(JSON.stringify(newTodos));
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <Button size="sm" onClick={handleAddTodo}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center gap-2">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => handleToggleTodo(todo.id)}
            />
            <span className={todo.completed ? "line-through text-gray-500" : ""}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}