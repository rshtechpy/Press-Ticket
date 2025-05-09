import { Chip, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const TagsFilter = ({ onFiltered }) => {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const { data } = await api.get(`/tags/list`);
                if (isMounted) {
                    setTags(data);
                }
            } catch (err) {
                if (isMounted) {
                    toastError(err);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const onChange = async (value) => {
        setSelecteds(value);
        onFiltered(value);
    }

    return (
        <Paper style={{ padding: 10 }}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                onChange={(e, v, r) => onChange(v)}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            style={{ backgroundColor: option.color || '#eee', textShadow: '1px 1px 1px #000', color: 'white' }}
                            label={option.name}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Filtro por Tags" />
                )}
            />
        </Paper>
    )
}

export default TagsFilter;