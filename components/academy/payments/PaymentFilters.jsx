"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentFilters({
  filters,
  onChange,

  courses = [],

  admins = [],
}) {
  //------------------------------------------------------------

  function update(field, value) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  //------------------------------------------------------------

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {/* Status */}

      <Select
        value={filters.status}
        onValueChange={(value) => update("status", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>

          <SelectItem value="completed">Completed</SelectItem>

          <SelectItem value="refunded">Refunded</SelectItem>

          <SelectItem value="partially_refunded">Partially Refunded</SelectItem>

          <SelectItem value="written_off">Written Off</SelectItem>
        </SelectContent>
      </Select>

      {/* Payment Method */}

      <Select
        value={filters.method}
        onValueChange={(value) => update("method", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Method" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>

          <SelectItem value="cash">Cash</SelectItem>

          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>

          <SelectItem value="card">Card</SelectItem>

          <SelectItem value="pos">POS</SelectItem>

          <SelectItem value="online">Online</SelectItem>
        </SelectContent>
      </Select>

      {/* Learning Mode */}

      <Select
        value={filters.learningMode}
        onValueChange={(value) => update("learningMode", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Learning Mode" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Modes</SelectItem>

          <SelectItem value="physical">Physical</SelectItem>

          <SelectItem value="online">Online</SelectItem>

          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>

      {/* Course */}

      <Select
        value={filters.course}
        onValueChange={(value) => update("course", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Course" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>

          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Recorded By */}

      <Select
        value={filters.recordedBy}
        onValueChange={(value) => update("recordedBy", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Recorded By" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Admins</SelectItem>

          {admins.map((admin) => (
            <SelectItem key={admin.id} value={admin.id}>
              {admin.first_name} {admin.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date */}

      <Select
        value={filters.period}
        onValueChange={(value) => update("period", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Period" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="today">Today</SelectItem>

          <SelectItem value="week">This Week</SelectItem>

          <SelectItem value="month">This Month</SelectItem>

          <SelectItem value="year">This Year</SelectItem>

          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
