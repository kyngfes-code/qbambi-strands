// components/ui/PageSpinner.jsx

export default function PageSpinner({ text = "Loading..." }) {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <div
          className="
            mx-auto
            h-12 w-12
            rounded-full
            border-4
            border-gray-200
            border-t-black
            animate-spin
          "
        />

        <p className="mt-4 text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
