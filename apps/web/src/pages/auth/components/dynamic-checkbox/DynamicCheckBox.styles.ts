import { createStyles } from '@mantine/core';
import { colors } from '@novu/design-system';

export default createStyles((theme, _params, getRef) => {
  const dark = theme.colorScheme === 'dark';

  return {
    input: {
      position: 'absolute',

      backgroundColor: 'transparent',
      borderColor: 'transparent',

      '&:hover': {
        border: `1px solid white`,
      },

      '&:checked': {
        backgroundImage: colors.horizontal,
        border: 'transparent',
      },
    },
    label: {
      paddingLeft: 4,
      fontSize: '14px',
      fontWeight: 'bold',
      color: dark ? colors.B60 : colors.B60,
    },
  };
});
