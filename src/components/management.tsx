import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

/** Presentation only. Mount within the management team's protected route. */
export function ManagementShell({ title, description, actions, children, headingLevel = 1 }: { title: string; description?: string; actions?: ReactNode; children: ReactNode; headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return <section className="management-shell"><header className="section-heading"><div><p className="eyebrow">Handbook management</p><Heading>{title}</Heading>{description && <p>{description}</p>}</div>{actions}</header>{children}</section>;
}

export function FormField({ label, hint, error, ...inputProps }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const id = inputProps.id ?? generatedId;
  const descriptionId = `${id}-description`;
  return <div className="form-field"><label htmlFor={id}>{label}</label><input {...inputProps} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? descriptionId : undefined} />{(error || hint) && <p className={error ? 'field-error' : 'field-hint'} id={descriptionId}>{error ?? hint}</p>}</div>;
}

export function Surface({ title, children }: { title?: string; children: ReactNode }) {
  return <section className="surface">{title && <h2>{title}</h2>}{children}</section>;
}

/** Semantic responsive table; the feature owner supplies cells and real action controls. */
export function DataTable({ caption, columns, children }: { caption: string; columns: string[]; children: ReactNode }) {
  return <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}><table className="data-table"><caption>{caption}</caption><thead><tr>{columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
