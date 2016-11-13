// Given still available amount of investment, updates funds
// to bring the overall distribution closer to the desired distribution.
function RunInvestmentRound(available_money, funds) {
  // Total net worth (invested plus to be invested).
  let net_worth = available_money;
  for (let fund of funds) {
    net_worth += fund.invested;
  }
  console.info("Total net worth is ", net_worth);

  // Calculate fund.current_percentage for each fund.
  for (let fund of funds) {
    const desired_investment = fund.goal_percentage * net_worth;
    const being_invested = fund.invested + fund.to_invest;
    fund.current_percentage = being_invested / desired_investment;

    console.info(
      `Fund ${fund.name} has ${fund.invested + fund.to_invest}, ` +
      ` which is at ${fund.current_percentage}% against the target ` +
      ` ${desired_investment}.`);
  }

  // Sort by current_percentage.
  funds.sort((f1, f2) => f1.current_percentage - f2.current_percentage);
  const smallest_being_invested = funds[0].invested + funds[0].to_invest;
  let second_smallest_being_invested = net_worth;
  let total_smallest_participants = 0;
  for (let fund of funds) {
    const being_invested = fund.invested + fund.to_invest;
    if (being_invested > smallest_being_invested) {
      // They are sorted, so we count ## of minimals and break immediately.
      second_smallest_being_invested = being_invested;
      break;
    }

    ++total_smallest_participants;
  }
  // Now we know how much to distribution and we split equally over all
  // participants with smallest distributions.
  const total_to_invest_this_round = Math.min(
    available_money,
    (second_smallest_being_invested - smallest_being_invested) * total_smallest_participants);
  const to_invest_for_each = total_to_invest_this_round / total_smallest_participants;
  console.assert(total_to_invest_this_round > 0);
  for (let fund of funds) {
    if (fund.invested + fund.to_invest < second_smallest_being_invested) {
      fund.to_invest += to_invest_for_each;
    }
  }

  return available_money - total_to_invest_this_round;
}

export default function RunAllInvestmentRounds(available_money, fund_values) {
  // Prepare fund info for investment iterations.
  function PopulateFund(fund_name, value) {
    return {
      // Fund index.
      name: fund_name,
      // Already invested.
      invested: value,
      // Amount to suggest investing into this fund.
      to_invest: 0,
      // Desired balance (ratio).
      goal_percentage: 1.0 / 3.0,
      // Achieved balance (ratio) after to_invest is invested.
      current_percentage: 0
    };
  }
  const funds = [
    PopulateFund("vbiax", fund_values[0]),
    PopulateFund("veirx", fund_values[1]),
    PopulateFund("vasgx", fund_values[2])
  ];

  let money = available_money;
  while (money > 0) {
    money = RunInvestmentRound(money, funds);
  }

  // Restore fund positions (they get sorted during investment rounds).
  let by_fund_name = {};
  for (let f of funds) {
    by_fund_name[f.name] = f;
  }

  // Round them up to dollarts and all cents to the last one.
  const allocations = [by_fund_name["vbiax"].to_invest, by_fund_name["veirx"].to_invest, by_fund_name["vasgx"].to_invest];
  let total_allocated = 0;
  for (let i = 0; i<allocations.length; ++i) {
    allocations[i] = Math.floor(allocations[i] * 100) / 100;
    total_allocated += allocations[i];
  }
  allocations[allocations.length - 1] += available_money - total_allocated;
  allocations[allocations.length - 1] = Math.round(allocations[allocations.length - 1] * 100) / 100
  return allocations;
}
