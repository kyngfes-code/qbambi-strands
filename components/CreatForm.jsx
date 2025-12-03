"use client";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";

function CreatForm() {
  const PROJECT_STATUSES = ["draft", "active", "finished"];

  const formSchema = z.object({
    title: z.string().min(1, { message: "At least one letter is expected" }),
    description: z
      .string()
      .max(40, { message: "not more than 40 characters" })
      .transform((v) => v || undefined),
    status: z.enum(["draft", "active", "finished"]),

    file: z.any().refine((files) => files?.length > 0, {
      message: "please upload an image",
    }),
    notification: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }),
    users: z
      .array(z.object({ email: z.email() }))
      .min(1)
      .max(5),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
      notification: {
        email: false,
        push: false,
        sms: false,
      },
      users: [{ email: "" }],
    },
  });
  const {
    fields: users,
    append: addUser,
    remove: removeUser,
  } = useFieldArray({ control: form.control, name: "users" });

  function onSubmit(values) {
    // FileList is inside values.file
    console.log("Form data:", values);

    const image = values.file[0];
    console.log("Uploaded Image:", image);
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="status"
          render={({ field: { onChange, onBlur, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <Select {...field} onValueChange={onChange}>
                <SelectTrigger
                  onBlur={onBlur}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <FieldDescription>Be as specific as possible</FieldDescription>
              </FieldContent>
              <Textarea
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="file"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Upload Image</FieldLabel>
              <Input
                id={field.name}
                type="file"
                onChange={(e) => field.onChange(e.target.files)}
              />
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        <FieldSet>
          <FieldLegend>Notification</FieldLegend>
          <FieldDescription>
            selct the method of notification you prefer
          </FieldDescription>
        </FieldSet>
        <FieldGroup data-slot="checkbox-group">
          <Controller
            control={form.control}
            name="notification.email"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <Checkbox
                  {...field}
                  id={field.name}
                  checked={value}
                  onCheckedChange={onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="notification.sms"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <Checkbox
                  {...field}
                  id={field.name}
                  checked={value}
                  onCheckedChange={onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Sms</FieldLabel>
                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="notification.push"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <Checkbox
                  {...field}
                  id={field.name}
                  checked={value}
                  onCheckedChange={onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    Push Notification
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <FieldSeparator />
        <FieldSet>
          <div>
            <FieldContent>
              <FieldLegend variant="label" className="mb-0">
                User Email Address
              </FieldLegend>
              <FieldDescription>
                Add up to 5 users to this poject
              </FieldDescription>
              {form.formState.errors.users?.root && (
                <FieldError errors={[form.formState.errors.users?.root]} />
              )}
            </FieldContent>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addUser({ email: "" })}
            >
              Add User
            </Button>
          </div>
        </FieldSet>

        <Button>Create</Button>
      </FieldGroup>
    </form>
  );
}

export default CreatForm;
