'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dictionary-slice';
import { Typography, TextInput, Textarea, Paper, useTheme } from '@esmalley/react-material-ui';

const RowDetails = ({ table, table_id }: { table: string; table_id: string }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.dictionaryReducer);
  const row = (state.row as Record<string, unknown>) || {};
  const formData = (state.form as Record<string, unknown>) || {};
  const error = state.formError;

  const handleChange = (key: string, value: string) => {
    let finalValue: unknown = value;
    if (typeof row[key] === 'object' && row[key] !== null) {
      try {
        finalValue = JSON.parse(value);
      } catch {
        finalValue = value;
      }
    }

    dispatch(setDataKey({
      key: 'form',
      value: {
        [`${table}_id`]: table_id,
        ...formData,
        [key]: finalValue,
      },
    }));
  };

  const getFieldValue = (key: string): string => {
    const val = formData[key];
    if (val === undefined || val === null) {
      return '';
    }
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  if (!Object.keys(row).length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Typography type="body2" style={{ color: theme.text.secondary }}>
          Row not found.
        </Typography>
      </div>
    );
  }

  const id = table_id || (formData[`${table}_id`] as string) || (row[`${table}_id`] as string) || '';
  const sections = tableDetails.resolveSections(formData);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {error && (
        <Typography type="body2" style={{ color: theme.error.main, marginBottom: '16px' }}>
          {error}
        </Typography>
      )}

      {/* Row ID Header */}
      <div style={{ marginBottom: '24px' }}>
        <Typography
          type="caption"
          style={{
            color: theme.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            display: 'block',
            marginBottom: '4px',
          }}
        >
          {tableDetails.getCaption()}
        </Typography>
        <Typography
          type="h5"
          style={{
            fontWeight: 700,
            wordBreak: 'break-all',
          }}
        >
          {tableDetails.getTitle(id)}
        </Typography>
      </div>

      {/* Grouped Section Papers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sections.map((section) => (
          <div style = {{ gap: '16px' }}>
              <Typography type="h6">
                {section.title}
              </Typography>
              {section.description && (
                <Typography type="caption" style={{ color: theme.text.secondary, marginTop: '2px', display: 'block' }}>
                  {section.description}
                </Typography>
              )}
            <Paper
              key={section.title}
              elevation={2}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {section.fields.map((field: FieldConfig) => (
                  <div key={field.key}>
                    {field.multiline ? (
                      <Textarea
                        label={field.label}
                        value={getFieldValue(field.key)}
                        variant="standard"
                        rows={field.rows || 3}
                        onChange={(val) => handleChange(field.key, val as string)}
                        disabled={field.disabled}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <TextInput
                        label={field.label}
                        value={getFieldValue(field.key)}
                        variant="standard"
                        onChange={(val) => handleChange(field.key, val as string)}
                        disabled={field.disabled}
                        style={{ width: '100%' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Paper>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RowDetails;
