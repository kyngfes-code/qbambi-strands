import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import storeItemImageEditor from "@/lib/actions";

export default async function Page({ params }) {
  const resolveParams = await params;
  const id = resolveParams.id;

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="w-64 p-6 border rounded-xl bg-white shadow-md">
        <h1 className="text-2xl font-semibold mb-6">Editing Image #{id}</h1>

        <form action={storeItemImageEditor}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="type" value="extra" />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="file">Upload Image</FieldLabel>
              <Input id="file" name="file" type="file" accept="image/*" />
            </Field>

            <Button type="submit" className="mt-4 w-full">
              Upload
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
