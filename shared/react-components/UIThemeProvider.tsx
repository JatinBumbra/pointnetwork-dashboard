import {ReactElement} from 'react';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import deepPurple from '@mui/material/colors/deepPurple';

const theme = createTheme({
    typography: {fontFamily: 'Arial'},
    palette: {
        mode: 'dark',
        primary: {
            main: deepPurple[500],
            light: deepPurple[300]
        }
    }
});

export default function UIThemeProvider({children}: {children: ReactElement | ReactElement[]}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
