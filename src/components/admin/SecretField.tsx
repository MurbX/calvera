'use client'

import { useField, TextInput, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

export function SecretField(props: TextFieldClientProps) {
  const { field } = props
  const { value, setValue } = useField<string>({ path: props.path })

  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel label={field.label || field.name} path={props.path} />
      <input
        type="password"
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        placeholder={field.admin?.placeholder as string || ''}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 14,
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 4,
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
        }}
      />
      {field.admin?.description && (
        <p style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginTop: 6 }}>
          {field.admin.description as string}
        </p>
      )}
    </div>
  )
}
