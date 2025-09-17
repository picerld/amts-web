export const Header = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex sm:flex-row flex-col justify-between">
      <div className="flex flex-col pb-5 gap-2">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-lg">{subtitle}</p>
      </div>

      {children}
    </div>
  );
};
