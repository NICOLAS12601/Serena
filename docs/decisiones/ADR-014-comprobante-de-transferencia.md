# ADR-014 · Con el comprobante de transferencia, el turno queda guardado hasta que se acredite

- **Estado:** Aceptada
- **Fecha:** 2026-10-18

## Contexto
Una reserva por transferencia guarda el turno unas horas (`transferHoldHours`, 2 por defecto) y se confirma cuando Micaela ve la plata en su cuenta ([ADR-005](ADR-005-pagos-mercadopago-y-transferencia.md)). Pero entre bancos distintos, si la transferencia no es instantánea, la plata puede acreditarse recién el día hábil siguiente o más tarde. La persona ya pagó y mandó el comprobante, y aun así el turno se liberaría al vencer el plazo.

## Decisión
- El plazo de la reserva (`transferHoldHours`) pasa a ser el plazo para **hacer la transferencia y mandar el comprobante**, no para que la plata llegue.
- En el panel, Micaela toca **"Recibí el comprobante"** cuando le llega por WhatsApp. La reserva sigue en `PENDING_VERIFICATION`, pero sin vencimiento (`holdExpiresAt = null`, `receiptReceivedAt` = cuándo llegó). El turno **queda guardado** y no se ofrece a nadie más.
- **El comprobante no confirma la reserva.** Se sigue confirmando solo al ver la plata ("Llegó la plata"). Si nunca llega, Micaela le escribe a la persona y cancela.
- Al marcar el comprobante, el panel ofrece **"Avisar por WhatsApp"** con un mensaje armado: *"Recibí tu comprobante. Apenas se acredite la transferencia te confirmo la reserva y te paso la dirección."*
- Si el comprobante llega **después de vencido el plazo**, se puede marcar igual, siempre que el horario siga libre.
- Las transferencias con comprobante siguen en "Para revisar" aunque pase la fecha de la sesión, hasta que Micaela las resuelva.

## Alternativas consideradas
- **Alargar el plazo** (por ejemplo, 48 h): simple, pero cada persona que elige transferencia y no paga bloquea el turno dos días, y para turnos cercanos el plazo vence después de la sesión.
- **Confirmar con el comprobante:** cómodo, pero es el fraude más común (capturas falsas o transferencias que se anulan).
- **Ofrecer transferencia solo con 48 h o más de anticipación:** se puede sumar más adelante si en la práctica aparecen turnos cercanos que no llegan a acreditarse.

## Consecuencias
- ➕ Refleja lo que pasa en la realidad: primero llega el comprobante, después la plata.
- ➕ Se mantiene la regla de oro: confirmar solo con la plata en la cuenta.
- ➖ Un comprobante falso guarda el turno hasta que Micaela lo note; el panel muestra hace cuánto llegó el comprobante para que lo vea.
- ➖ Depende de que Micaela marque el comprobante a tiempo: si no lo hace dentro del plazo, el turno se libera (lo puede marcar después si sigue libre).
