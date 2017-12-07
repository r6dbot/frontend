import { v2Api } from "lib/constants";
import { failEarly, getHeaders } from "../utils";
import handleResponse from "../handlePlayer";

const getPlayer = id => {
    return fetch(`${v2Api}/players/${id}`, { headers: getHeaders() })
        .then(failEarly)
        .then(res => res.json());
};

export default function(id) {
    return getPlayer(id).then(handleResponse);
}
