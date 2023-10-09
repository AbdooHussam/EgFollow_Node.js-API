for (let index = 0; index < cards.length; index++) {
  const e = cards[index];
  cards[index]["classids"] = e["classids"].includes(",")
    ? e["classids"].split(",")
    : e["classids"].split();
  //////////////////////////// Classes ////////////////////////////////////
  for (let x = 0; x < cards[index]["classids"].length; x++) {
    const ee = cards[index]["classids"][x];
    let classIndex = classes.findIndex((e) => e["id"] == ee);
    if (classIndex != -1) {
      // cards[index]["classids"][x] = classes[classIndex]["name"];
      cards[index]["classids"][x] = {
        id: classes[classIndex]["id"],
        name: classes[classIndex]["name"],
        short: classes[classIndex]["short"],
        number: classes[classIndex]["number"],
      };
    }
  }
  //////////////////////////// Subjects ////////////////////////////////////
  const subjectIndex = subjects.findIndex(
    (e) => e["id"] == cards[index]["subjectid"]
  );
  if (subjectIndex != -1) {
    cards[index]["subjectid"] = {
      id: subjects[subjectIndex]["id"],
      name: subjects[subjectIndex]["name"],
      short: subjects[subjectIndex]["short"],
      number: subjects[subjectIndex]["number"],
    };
  }
  //////////////////////////// teachers ////////////////////////////////////
  const teacherIndex = teachers.findIndex(
    (e) => e["id"] == cards[index]["teacherid"]
  );
  if (teacherIndex != -1) {
    cards[index]["teacherid"] = {
      id: teachers[teacherIndex]["id"],
      firstname: teachers[teacherIndex]["firstname"],
      lastname: teachers[teacherIndex]["lastname"],
      name: teachers[teacherIndex]["name"],
      short: teachers[teacherIndex]["short"],
      short: teachers[teacherIndex]["short"],
      gender: teachers[teacherIndex]["gender"],
      email: teachers[teacherIndex]["email"],
      mobile: teachers[teacherIndex]["mobile"],
      number: teachers[teacherIndex]["number"],
    };
  }
  //////////////////////////// classroom ////////////////////////////////////
  const classroomIndex = classrooms.findIndex(
    (e) => e["id"] == cards[index]["classroomid"]
  );
  if (classroomIndex != -1) {
    cards[index]["classroomid"] = {
      id: classrooms[classroomIndex]["id"],
      name: classrooms[classroomIndex]["name"],
      short: classrooms[classroomIndex]["short"],
    };
  }

  //////////////////////////// period ////////////////////////////////////
  const periodIndex = periods.findIndex(
    (e) => e["period"] == cards[index]["period"]
  );
  if (periodIndex != -1) {
    cards[index]["period"] = {
      period: periods[periodIndex]["period"],
      starttime: periods[periodIndex]["starttime"],
      endtime: periods[periodIndex]["endtime"],
    };
  }

  //////////////////////////// day ////////////////////////////////////
  const dayIndex = days.findIndex((e) => e["day"] == cards[index]["day"]);
  if (dayIndex != -1) {
    cards[index]["day"] = {
      day: days[dayIndex]["day"],
      name: days[dayIndex]["name"],
      short: days[dayIndex]["short"],
    };
  }
}

for (let y = 0; y < cards.length; y++) {
  const e = cards[y];
  schedule.push({
    doctor: e["teacherid"],
    subject: e["subjectid"],
    period: e["period"],
    day: e["day"],
    classes: e["classids"],
    classroom: e["classroomid"],
  });
}
