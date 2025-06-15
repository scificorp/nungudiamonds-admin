import { Grid, TextField } from "@mui/material";
import React, { useState } from "react";
import styled from "styled-components";
import TccInput from "../Form-Elements/inputField";

const Container = styled.span`
  display: inline-flex;
  align-items: center;
  width: 200px;
  max-width: 150px;
  padding: 4px 12px;
  border: 1px solid #bfc9d9;
  border-radius: 4px;

  input[type="color"] {
    margin-right: 8px;
    -webkit-appearance: none;
    border: none;
    width: auto;
    height: auto;
    cursor: pointer;
    background: none;
    &::-webkit-color-swatch-wrapper {
      padding: 0;
      width: 14px;
      height: 14px;
    }
    &::-webkit-color-swatch {
      border: 1px solid #bfc9d9;
      border-radius: 4px;
      padding: 0;
    }
  }

  input[type="text"] {
    border: none;
    width: 100%;
    font-size: 14px;
  }
`;

const ColorPicker = (props: any) => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} md={9} lg={9}>
                    <Grid item xs={12}>
                        <TccInput type="color" {...props} size='small' fullWidth sx={{ mb: 4 }} />

                    </Grid>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                    <Grid item xs={12}>
                        <TccInput type="text" {...props} size='small' fullWidth />

                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

const TccColorPicker = ({ onChange, value, sx }: any) => {

    return (
        <div className="App">
            <ColorPicker onChange={onChange} value={value} sx={sx} />
        </div>
    );
}

export default TccColorPicker