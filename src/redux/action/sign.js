import { setLoading, setStep } from "../store/popup/sign";
import axios from 'axios'
import { SIGN_STEP } from "../../constants/sign";

const sendForm = (body) => async dispatch => {
    dispatch(setLoading(true))

    axios.post(`https://formcarry.com/s/Bnmua4y22WE`, body).finally(() => {
        dispatch(setLoading(false))
        dispatch(setStep(SIGN_STEP.DONE))
    })
}

export const sendFormAsInfluencer = (data) => async dispatch => {
    dispatch(sendForm({
        type: 'influenceur',
        pseudos: Object.entries(data.pseudos).map(e => {
            return `[${e[0]}] : ${e[1]}`
        }).reduce((a, b) => `${a} | ${b}`)
    }))
}

export const sendFormAsBusiness = (data) => async dispatch => {
    dispatch(sendForm({
        type: 'business',
        nbInfluencers: `${data.nbInfluencers.value}`,
        email: data.email,
        socials: data.selectedSocials.join(', '),
    }))
}