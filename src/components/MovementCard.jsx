import {
  formatCategory,
  formatMovementAmount,
  formatMovementDate,
  getMovementAmountStatus,
  getMovementCounterpartyLabel,
  getMovementFlags,
  getMovementPaymentMethod,
  getMovementSubject,
  resolveMovementAmount,
  resolveMovementBank,
  resolveMovementCounterparty,
} from "../utils/movementFormatters";

export default function MovementCard({ movement }) {
  const subject = getMovementSubject(movement);
  const rawAmount = resolveMovementAmount(movement);
  const amountStatus = getMovementAmountStatus(movement);
  const amount = formatMovementAmount(rawAmount, amountStatus);
  const counterparty = resolveMovementCounterparty(movement);
  const bank = resolveMovementBank(movement);
  const flags = getMovementFlags(movement);
  const paymentMethod = flags.isConsumption
    ? getMovementPaymentMethod(subject)
    : "";
  const counterpartyLabel = getMovementCounterpartyLabel(flags);

  return (
    <div className="movement-card">
      <div className="movement-row">
        <div className="movement-info">
          <p className="movement-date">{formatMovementDate(movement)}</p>
          <p className="movement-subject">{subject}</p>
          <div className="movement-meta">
            {amount && (
              <span className={`movement-amount movement-amount--${amountStatus}`}>
                {amount}
              </span>
            )}
            {!flags.isWithdrawal && (
              <span className="movement-meta-item">
                <span className="movement-meta-label">{counterpartyLabel}</span>
                <span>{counterparty}</span>
              </span>
            )}
            {flags.isTransfer && bank && (
              <span className="movement-meta-item">
                <span className="movement-meta-label">Banco</span>
                <span>{bank}</span>
              </span>
            )}
            {paymentMethod && (
              <span className="movement-meta-item">
                <span className="movement-meta-label">Metodo</span>
                <span>{paymentMethod}</span>
              </span>
            )}
          </div>
        </div>
        <span className="pill pill--soft">{formatCategory(movement.category)}</span>
      </div>
    </div>
  );
}
